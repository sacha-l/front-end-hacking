import React from "react";
import {
  Button,
  Card,
  Grid,
  Message,
  Modal,
  Form,
  Label,
} from "semantic-ui-react";

import KittyAvatar from "./KittyAvatar";
import { TxButton } from "./substrate-lib/components";

// --- About Modal ---

const TransferModal = (props) => {
  const { kitty, accountPair, setStatus } = props;
  const [open, setOpen] = React.useState(false);
  const [formValue, setFormValue] = React.useState({});

  const formChange = (key) => (ev, el) => {
    setFormValue({ ...formValue, [key]: el.value });
  };

  const confirmAndClose = (unsub) => {
    unsub();
    setOpen(false);
  };

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button basic color="blue">
          Transfer
        </Button>
      }
    >
      <Modal.Header>Kitty Transfer</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input fluid label="Kitty ID" readOnly value={kitty.dna} />
          <Form.Input
            fluid
            label="Kitty"
            placeholder="Send to"
            onChange={formChange("target")}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button basic color="grey" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <TxButton
          accountPair={accountPair}
          label="Confirm Transfer"
          type="SIGNED-TX"
          setStatus={setStatus}
          onClick={confirmAndClose}
          attrs={{
            palletRpc: "substrateKitties",
            callable: "transfer",
            inputParams: [formValue.target, kitty.id],
            paramFields: [true, true],
          }}
        />
      </Modal.Actions>
    </Modal>
  );
};

// --- About Kitty Card ---

const KittyCard = (props) => {
  const { kitty, accountPair, setStatus } = props;
  const { id = null, dna = null, owner = null, price = null, gender = null } = kitty;
  const displayDna = dna && dna.join(", ");
  const displayPrice = price === 0 ? "Not for sale" : price.toString(); // || "Not for sale";
  const displayId = id === null ? "" : id < 10 ? `0${id}` : id.toString();
  const isSelf = accountPair.address === kitty.owner;

  return (
    <Card>
      {isSelf && (
        <Label as="a" floating color="black">
          My Kitties
        </Label>
      )}
      <KittyAvatar dna={dna} />
      <Card.Content>
        <Card.Header>Kitty ID : {displayId}</Card.Header>
        <Card.Meta style={{ overflowWrap: "break-word" }}>
          <strong>Gene sequence:</strong><br />
          {dna}
        </Card.Meta>
        <Card.Description>
          <p style={{ overflowWrap: "break-word" }}>
            <strong>Owner:</strong><br />
            {owner}
          </p>
          <p><strong>Price:</strong> {displayPrice}</p>
          <p style={{ overflowWrap: "break-word" }}>
            Gender: {gender}
          </p>          
        </Card.Description>
      </Card.Content>
      <Card.Content extra style={{ textAlign: "center" }}>
        {kitty.owner === accountPair.address ? (
          <TransferModal
            kitty={kitty}
            accountPair={accountPair}
            setStatus={setStatus}
          />
        ) : (
          ""
        )}
      </Card.Content>
    </Card>
  );
};

const KittyCards = (props) => {
  const { kitties, accountPair, setStatus } = props;

  if (kitties.length === 0) {
    return (
      <Message info>
        <Message.Header>
          Start by creating a kitty &nbsp;
          <span role="img" aria-label="point-down">
            👇
          </span>
        </Message.Header>
      </Message>
    );
  }
  return <Grid columns={3}>{kitties.map((kitties, i) =>
    <Grid.Column key={`kitty-${i}`}>
      <KittyCard kitty={kitties} accountPair={accountPair} setStatus={setStatus}/>
    </Grid.Column>
  )}</Grid>;
};

export default KittyCards;
