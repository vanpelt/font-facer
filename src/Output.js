import React from "react";
import { Grid, Segment } from "semantic-ui-react";

export default function Output(props) {
  return (
    <Grid>
      <Grid.Row>
        <h3>Output</h3>
      </Grid.Row>
      <Grid.Row>{JSON.stringify(props.coefficients)}</Grid.Row>
      <Grid.Row style={{ fontSize: 14, fontFamily: "fontc" }}>
        <Segment>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Segment>
      </Grid.Row>
    </Grid>
  );
}
