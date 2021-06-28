import React, { useEffect, useState } from "react";
import { Form, Grid } from "semantic-ui-react";

import { useSubstrate } from "./substrate-lib";
import { TxButton } from "./substrate-lib/components";

import KittyCards from "./KittyCards";

export default function Kitties(props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [kittyDNAs, setKittyDNAs] = useState([]);
  const [kittyOwners, setKittyOwners] = useState([]);
  const [kittyPrices, setKittyPrices] = useState([]);
  const [kittyGender, setKittyGender] = useState([]);
  const [kitties, setKitties] = useState([]);
  const [status, setStatus] = useState("");

  // Will be an array of Kitty objects.
  const [kittiesObject, setKittiesObject] = useState([]);

  // Get Kitty object.
  const [kittyCnt, setKittyCnt] = useState(0);

  const fetchKittyCnt = () => {
    let unsubDnas = null;
    let unsubOwners = null;
    let unsubPrices = null;
    let unsubGender = null;

    const asyncFetch = async () => {
      // Get total number of Kitties
      api.query.substrateKitties.allKittiesCount(async (cnt) => {
        const cntNum = cnt.toNumber();
        setKittyCnt(cntNum);

        console.log(`kitty count: ${cntNum}`);

        // Here we fetch all the kitty hashes.
        const kittyIndices = [...Array(cntNum).keys()];
        api.query.substrateKitties.allKittiesArray.multi(
          kittyIndices,
          (keys) => {
            console.log(
              "All kitty keys:",
              keys.map((key) => key.toHuman())
            );
            // Fetching all kitties based on the kitty key;
            api.query.substrateKitties.kitties.multi(keys, (kittyInfo) => {

              setKitties(kittyInfo);
            });

            // Get owners.
            api.query.substrateKitties.kittyOwner.multi(keys, (owners) =>
              setKittyOwners(owners.map((owner) => owner.toHuman()))
            );
          }
        );
      });
    };

    asyncFetch();

    // return the unsubscription cleanup functions.
    return () => {
      // unsubDnas && unsubDnas();
      // unsubOwners && unsubOwners();
      // unsubGender && unsubGender();
    };
  };

  const populateKitties = () => {
    const kittyIndices = [...Array(kittyCnt).keys()];
    const kittiesArray = kittyIndices.map((ind) => ({
      id: ind,
      hash: kittyIndices[kittyCnt],
      dna: kitties[ind].dna,
      owner: kittyOwners[ind],
      price: kitties[ind].price.toHuman(),
      gender: kitties[ind].gender.isMale ? "Male": "Female" 
    }));

    console.log(
      "Kitties array", kittiesArray
    )

    setKittiesObject(kittiesArray);
  };

  useEffect(fetchKittyCnt, [api, keyring]);
  useEffect(populateKitties, [kittyOwners]);
  useEffect(populateKitties, [kitties]);

  return (
    <Grid.Column width={16}>
      <h1>Substrate Kitties</h1>
      <KittyCards
        kitties={kittiesObject}
        accountPair={accountPair}
        setStatus={setStatus}
      />
      <Form style={{ margin: "1em 0" }}>
        <Form.Field style={{ textAlign: "center" }}>
          <TxButton
            accountPair={accountPair}
            label="Create Kitty"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: "substrateKitties",
              callable: "createKitty",
              inputParams: [],
              paramFields: [],
            }}
          />
        </Form.Field>
      </Form>
      <div style={{ overflowWrap: "break-word" }}>{status}</div>
    </Grid.Column>
  );
}
