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

import React, { useState, useEffect } from 'react';
import { Tabs } from '@react-spectrum/tabs';
import { Item } from '@adobe/react-spectrum';
import InitTabContent from './InitTabContent';

import GetSettingsTabContent from './GetSettingsTabContent';
import ValidateTabContent from './ValidateTabContent';
import getInitContent from './helpers/getInitContent';
import extensionViewInit from './helpers/extensionViewInit';
import reportFatalError from './helpers/reportFatalError';
import getDefaultInitInfo from './helpers/getDefaultInitInfo';
import getNewBridge from '../helpers/getNewBridge';
import { LOG_PREFIX } from './helpers/constants';

const mergeSettingsOnTopOfIniContent = ({ initContent, settings }) => {
  try {
    const parsedContent = JSON.parse(initContent);
    const parsedSettings = JSON.parse(settings);

    return JSON.stringify(
      {
        ...parsedContent,
        settings: parsedSettings
      },
      null,
      2
    );
  } catch (e) {
    reportFatalError(e);
  }

  return null;
};

export default ({
  selectedDescriptor,
  extensionDescriptor,
  extensionViewPaneRef,
  setDataElementSelectorModal,
  setCodeEditorModal
}) => {
  const [selectedTab, setSelectedTab] = useState('init');
  const [initContent, setInitContent] = useState();
  const [currentExtensionBridge, setCurrentExtensionBridge] = useState({});

  useEffect(() => {
    if (!selectedDescriptor || !extensionDescriptor) {
      return;
    }

    const newInitContent = getInitContent({ extensionDescriptor, selectedDescriptor });
    setInitContent(newInitContent);
    const parsedContent = JSON.parse(newInitContent);

    const newBrige = getNewBridge({
      setDataElementSelectorModal,
      setCodeEditorModal,
      parentContainerRef: extensionViewPaneRef,
      extensionDescriptor,
      selectedDescriptor,
      initInfo: parsedContent
    });

    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} init() with`, parsedContent);

    setCurrentExtensionBridge(newBrige);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDescriptor, extensionDescriptor]);

  return (
    <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab} height="100%">
      <Item title="Init" key="init">
        <InitTabContent
          content={initContent}
          onChange={setInitContent}
          onInitPress={() => {
            extensionViewInit({
              extensionDescriptor,
              selectedDescriptor,
              extensionBridge: currentExtensionBridge,
              content: initContent
            });
          }}
          onResetPress={() => {
            const newInitContent = getDefaultInitInfo(selectedDescriptor);
            setInitContent(newInitContent);
            extensionViewInit({
              extensionDescriptor,
              selectedDescriptor,
              extensionBridge: currentExtensionBridge,
              content: newInitContent
            });
          }}
        />
      </Item>
      <Item title="Get Settings" key="settings">
        <GetSettingsTabContent
          onCopySettingsPress={(newSettings) => {
            const newInitContent = mergeSettingsOnTopOfIniContent({
              initContent,
              settings: newSettings
            });
            setInitContent(newInitContent);
            extensionViewInit({
              extensionDescriptor,
              selectedDescriptor,
              extensionBridge: currentExtensionBridge,
              content: newInitContent
            });
            setSelectedTab('init');
          }}
          extensionBridge={currentExtensionBridge}
          setSelectedTab={setSelectedTab}
        />
      </Item>
      <Item title="Validate" key="validate">
        <ValidateTabContent
          extensionBridge={currentExtensionBridge}
          selectedDescriptor={selectedDescriptor}
        />
      </Item>
    </Tabs>
  );
};
