opCodes = {
  MOUSE_MOVE: 0x01,
  MOUSE_BTN_DWN: 0x02,
  MOUSE_BTN_UP: 0x03,
  MOUSE_BTN_DWN: 0x04,
  MOUSE_BTN_CLK: 0x05,
  KEY_DOWN: 0x06,
  KEY_UP: 0x07,
  REQUEST_CONTROL: 0x08,
  RELEASE_CONTROL: 0x09,


  ERROR: 0xFF
};
const list = new Set;
for(const key in opCodes) {
  list.add(opCodes[key]);
}
opCodes.list = list;