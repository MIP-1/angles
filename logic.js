/* Core angle-pair classification: pure geometry from figure.png.
 *
 * Each angle carries: vertex (crossing), quad (quadrant), and per-setup
 * side+zone. Every shared setup is evaluated with the textbook general rules;
 * all named results must agree or the pair is flagged (never guessed).
 * Uncovered cases get NEUTRAL gray messages (kind:'neutral'), never red.
 *
 * ===== THE ONLY RED-ERROR EXCEPTION (easy to remove) =====
 * Pair 4&11 always returns the red error. To remove it, delete the
 * redErrorPairs entry in data.json and this marked block.
 * ==========================================================
 * Browser + Node compatible. No dependencies. */
(function (root) {
  var OPPOSITE_QUAD = { UL: "LR", LR: "UL", UR: "LL", LL: "UR" };
  var SIDE_WORD = { above: "أعلى", below: "أسفل", left: "يسار", right: "يمين" };

  function pairKey(x, y) { return Math.min(x, y) + "," + Math.max(x, y); }

  function neutral(code, message, extra) {
    var out = { kind: "neutral", code: code, message: message };
    if (extra) for (var k in extra) out[k] = extra[k];
    return out;
  }

  function classifyPair(a, b, data) {
    var x = parseInt(a, 10);
    var y = parseInt(b, 10);
    if (isNaN(x) || isNaN(y)) {
      return neutral("invalid", "رقم زاوية غير صالح.");
    }
    if (x === y) {
      return neutral("sameAngle", "اخترت الزاوية نفسها مرتين — اختر زاويتين مختلفتين.");
    }
    var kk = pairKey(x, y);

    /* ===== THE ONLY RED-ERROR EXCEPTION — delete to remove ===== */
    if ((data.redErrorPairs || []).indexOf(kk) !== -1) {
      return { kind: "error", error: data.errorMessage };
    }
    /* =========================================================== */

    var px = data.positions[String(x)];
    var py = data.positions[String(y)];
    if (!px || !py) {
      return neutral("invalid", "رقم زاوية غير صالح.");
    }

    // Same crossing: vertical (opposite quadrants) or adjacent (shared side).
    if (px.vertex === py.vertex) {
      if (OPPOSITE_QUAD[px.quad] === py.quad) {
        return neutral("vertical",
          "متقابلتان بالرأس عند التقاطع " + px.vertex +
          " — تشتركان في الرأس فقط، وهي ليست من العلاقات الأربع المسماة.",
          { vertex: px.vertex });
      }
      return neutral("adjacent",
        "متجاورتان عند التقاطع " + px.vertex +
        " — تشتركان في ضلع، وهي ليست من العلاقات الأربع المسماة.",
        { vertex: px.vertex });
    }

    // Different crossings: evaluate EVERY shared setup, require agreement.
    // (Same-vertex pairs returned above; any shared setup here is valid.)
    var named = [];
    var fits = [];
    var ids = data.configs.map(function (c) { return c.id; });
    for (var i = 0; i < ids.length; i++) {
      var cid = ids[i];
      var pa = px[cid];
      var pb = py[cid];
      if (!pa || !pb) continue;
      {
        var opposite = pa.side !== pb.side;
        var aInt = pa.zone === "int";
        var bInt = pb.zone === "int";
        var rel = null;
        if (opposite && aInt && bInt) rel = data.relations.alternateInterior;
        else if (opposite && !aInt && !bInt) rel = data.relations.alternateExterior;
        else if (!opposite && aInt && bInt) rel = data.relations.consecutive;
        else if (!opposite && (aInt !== bInt)) rel = data.relations.corresponding;
        if (rel) {
          named.push({ relation: rel, config: cid });
        } else {
          fits.push({ config: cid, pa: pa, pb: pb });
        }
      }
    }

    if (named.length === 0) {
      if (fits.length === 0) {
        return neutral("noShared",
          "لا تجمع الزاويتين قاطعة واحدة مشتركة — لا علاقة مسماة بينهما.");
      }
      // Describe the geometric situation precisely (no guessing a relation).
      var f = fits[0];
      var sideTxt = SIDE_WORD[f.pa.side] || f.pa.side;
      if (f.pa.side === f.pb.side && f.pa.zone === "ext" && f.pb.zone === "ext") {
        return neutral("sameSideExterior",
          "على الجهة نفسها من القاطع " + f.config + " (" + sideTxt +
          ") وكلتاهما خارجية — لا علاقة مسماة لهذه الحالة في المنهج.",
          { config: f.config });
      }
      return neutral("oppositeMixed",
        "على جهتين مختلفتين من القاطع " + f.config +
        " وإحداهما داخلية والأخرى خارجية — لا علاقة مسماة لهذه الحالة في المنهج.",
        { config: f.config });
    }

    var first = named[0].relation;
    for (var j = 1; j < named.length; j++) {
      if (named[j].relation !== first) {
        return neutral("conflict",
          "تعارض بين الإعدادات (" + named[0].config + " و" + named[j].config +
          ") — توقف بدون تخمين.");
      }
    }
    return { kind: "relation", relation: first, config: named[0].config };
  }

  var api = { classifyPair: classifyPair };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.AnglesLogic = api;
  }
})(typeof self !== "undefined" ? self : globalThis);
