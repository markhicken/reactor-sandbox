/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Map, List } from 'immutable';
import {
  Dialog,
  DialogContainer,
  Heading,
  Content,
  ButtonGroup,
  Button,
  Picker,
  Divider,
  Item
} from '@adobe/react-spectrum';

class ModalDataElementSelectorEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataElementSelectorModal: Map(),
      prevModalSize: props.modals.size
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.modals.size !== prevState.prevModalSize) {
      return {
        prevModalSize: nextProps.modals.size,
        dataElementSelectorModal: nextProps.modals.getIn(['dataElementSelectorModal'])
      };
    }

    return null;
  }

  handleOnSave = () => {
    const { dataElementSelectorModal } = this.state;
    const { closeDataElementSelectorModal } = this.props;

    let newDataElement = '';
    if (dataElementSelectorModal.get('dataElement')) {
      newDataElement = `%${dataElementSelectorModal.get('dataElement')}%`;
    }

    dataElementSelectorModal.get('onSave')(newDataElement);
    closeDataElementSelectorModal();
  };

  handleOnClose = () => {
    const { dataElementSelectorModal } = this.state;
    const { closeDataElementSelectorModal } = this.props;

    dataElementSelectorModal.get('onClose')();
    closeDataElementSelectorModal();
  };

  handleDataElementChange = (dataElement) => {
    const { dataElementSelectorModal } = this.state;

    this.setState({
      dataElementSelectorModal: dataElementSelectorModal.set('dataElement', dataElement)
    });
  };

  dataElementList() {
    const { dataElements } = this.props;
    return (dataElements || List()).valueSeq().map((v) => ({
      id: v.get('name'),
      name: v.get('name')
    }));
  }

  render() {
    const { dataElementSelectorModal } = this.state;

    return dataElementSelectorModal && dataElementSelectorModal.get('open') ? (
      <DialogContainer>
        <Dialog>
          <Heading>Data Element Selector</Heading>
          <Divider />
          <Content>
            <Picker
              marginTop="size-150"
              label="Data Element"
              selectedKey={dataElementSelectorModal.get('dataElement') || ''}
              onSelectionChange={this.handleDataElementChange}
              width="100%"
              items={this.dataElementList()}
            >
              {(item) => <Item>{item.name}</Item>}
            </Picker>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={this.handleOnClose}>
              Cancel
            </Button>
            <Button variant="cta" onPress={this.handleOnSave}>
              Save
            </Button>
          </ButtonGroup>
        </Dialog>
      </DialogContainer>
    ) : null;
  }
}

const mapState = (state) => ({
  modals: state.modals,
  dataElements: state.dataElements
});

const mapDispatch = ({ modals: { closeDataElementSelectorModal } }) => ({
  closeDataElementSelectorModal: (payload) => closeDataElementSelectorModal(payload)
});

export default withRouter(connect(mapState, mapDispatch)(ModalDataElementSelectorEditor));
