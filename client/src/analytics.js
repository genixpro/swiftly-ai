/**
 * Local demo analytics adapter. The former hosted Mixpanel integration has no
 * place in a single-user offline workflow; keeping this tiny compatible API
 * means old screen-level tracking calls never affect rendering or data entry.
 */
const analytics = {
  track() {},
  identify() {},
  reset() {},
  people: { set() {} },
};

export default analytics;
