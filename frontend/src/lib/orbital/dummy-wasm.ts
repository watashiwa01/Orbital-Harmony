// Dummy mock for WebAssembly modules to bypass top-level await and pthread errors during bundling
export default function createWasmModule() {
  return Promise.resolve({
    _create_rundata_struct_layout_string_pointer: () => 0,
    _free: () => {},
    cwrap: () => async () => {},
    _compute: () => {},
    _exit_runtime: () => {},
  });
}
