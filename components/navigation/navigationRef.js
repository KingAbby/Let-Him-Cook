/**
 * Navigation reference to allow navigation from components outside the navigation stack
 * This is useful for handling edge cases where the navigation context is not available
 */

import { createRef } from "react";

export const navigationRef = createRef();

export const isReady = () => {
  return navigationRef.current !== null;
};

export default {
  navigationRef,
  isReady,
};
