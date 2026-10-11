
'use client';

import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();

    setDeviceInfo(
      `${result.device.type || 'desktop'}-${result.os.name || 'Unknown'}-${result.os.version || 'Unknown'}-${result.browser.name || 'Unknown'}-${result.browser.version || 'Unknown'}`
    );
  }, []);

  return deviceInfo;
};

export default useDeviceTracking;
