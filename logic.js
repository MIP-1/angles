/* Core angle-pair classification: textbook general rules per setup.
 * Authority: positions from figure.png + textbook definitions + explicit
 * user overrides in data.json (overrides win over geometry).
 * Any pair not covered -> Error. Browser + Node compatible. No dependencies. */
(function (root) {
  function classifyPair(a, b, data) {
    var x = parseInt(a, 10);
    var y = parseInt(b, 10);
    var err = { relation: null, error: data.errorMessage, config: null, overridden: false };
    if (isNaN(x) || isNaN(y)) return err;
    if (x === y) return err;
    var key = Math.min(x, y) + "," + Math.max(x, y);

    // Explicit user overrides always win.
    if (data.overrides && Object.prototype.hasOwnProperty.call(data.overrides, key)) {
      var ov = data.overrides[key];
      if (ov) return { relation: ov, error: null, config: "override", overridden: true };
      err.overridden = true;
      err.config = "override";
      return err;
    }

    // General textbook rules in each setup containing both angles at different vertices.
    var ids = data.configs.map(function (c) { return c.id; });
    var px = data.positions[String(x)];
    var py = data.positions[String(y)];
    if (!px || !py) return err;
    var fitted = null;
    for (var i = 0; i < ids.length; i++) {
      var cid = ids[i];
      var pa = px[cid];
      var pb = py[cid];
      if (!pa || !pb) continue;
      if (pa.vertex === pb.vertex) continue; // same crossing -> not a pair
      var opposite = pa.side !== pb.side;
      var same = !opposite;
      var aInt = pa.zone === "int";
      var bInt = pb.zone === "int";
      var rel = null;
      if (opposite && aInt && bInt) rel = data.relations.alternateInterior;
      else if (opposite && !aInt && !bInt) rel = data.relations.alternateExterior;
      else if (same && aInt && bInt) rel = data.relations.consecutive;
      else if (same && (aInt !== bInt)) rel = data.relations.corresponding;
      if (rel) return { relation: rel, error: null, config: cid, overridden: false };
      if (!fitted) fitted = cid;
    }
    if (fitted) err.config = fitted;
    return err;
  }

  var api = { classifyPair: classifyPair };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.AnglesLogic = api;
  }
})(typeof self !== "undefined" ? self : globalThis);
