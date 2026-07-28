(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const SVG_NS = "http://www.w3.org/2000/svg";

  const defaults = {
    AB: 9.37,
    DC: 6.92,
    DE: 5.16,
    angleB: 47.77,
    angleF: 57.83,
    angleA: 97.66
  };

  const state = {
    result: null,
    steps: [],
    currentStep: 0,
    zoom: 1,
    toScale: false,
    drawMode: false,
    points: null,
    draggedPoint: null,
    uploadedImageUrl: null
  };

  const elements = {
    form: $("#dataForm"),
    formMessage: $("#formMessage"),
    solveButton: $("#solveButton"),
    inputs: {
      AB: $("#inputAB"),
      DC: $("#inputDC"),
      DE: $("#inputDE"),
      angleB: $("#inputB"),
      angleF: $("#inputF"),
      angleA: $("#inputA")
    },
    svg: $("#geometrySvg"),
    zoomLayer: $("#zoomLayer"),
    pointLayer: $("#pointLayer"),
    labels: $("#measureLabels"),
    rightAngles: $("#rightAngles"),
    angleArcs: $("#angleArcs"),
    outerShape: $("#outerShape"),
    figureTip: $("#figureTip span:last-child"),
    figureModeLabel: $("#figureModeLabel"),
    dragHelper: $("#dragHelper"),
    diagramStage: $("#diagramStage"),
    photoStage: $("#photoStage"),
    diagramTab: $("#diagramTab"),
    photoTab: $("#photoTab"),
    photoInput: $("#photoInput"),
    photoThumbnail: $("#photoThumbnail"),
    photoViewer: $("#photoViewer"),
    promptInput: $("#promptInput"),
    perimeterResult: $("#perimeterResult"),
    areaResult: $("#areaResult"),
    angleResults: $("#angleResults"),
    resultSubtitle: $("#resultSubtitle"),
    consistencyWarning: $("#consistencyWarning"),
    consistencyText: $("#consistencyText"),
    measurementGrid: $("#measurementGrid"),
    printButton: $("#printButton"),
    stepBadge: $("#stepBadge"),
    stepTitle: $("#stepTitle"),
    stepKnown: $("#stepKnown"),
    stepDescription: $("#stepDescription"),
    stepRule: $("#stepRule"),
    stepFormula: $("#stepFormula"),
    stepResult: $("#stepResult"),
    stepDots: $("#stepDots"),
    previousStep: $("#previousStepButton"),
    nextStep: $("#nextStepButton"),
    scaleButton: $("#scaleButton"),
    editDataButton: $("#editDataButton"),
    toast: $("#toast")
  };

  function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  function radToDeg(radians) {
    return radians * 180 / Math.PI;
  }

  function parseLocaleNumber(value, optional = false) {
    const clean = String(value ?? "").trim().replace(/\s/g, "").replace(",", ".");
    if (!clean && optional) return null;
    const parsed = Number(clean);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function formatNumber(value, digits = 2) {
    return new Intl.NumberFormat("es-UY", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function texNumber(value, digits = 2) {
    return formatNumber(value, digits).replace(",", "{,}");
  }

  function readInputs() {
    return {
      AB: parseLocaleNumber(elements.inputs.AB.value),
      DC: parseLocaleNumber(elements.inputs.DC.value),
      DE: parseLocaleNumber(elements.inputs.DE.value),
      angleB: parseLocaleNumber(elements.inputs.angleB.value),
      angleF: parseLocaleNumber(elements.inputs.angleF.value),
      angleA: parseLocaleNumber(elements.inputs.angleA.value, true)
    };
  }

  function validateData(data) {
    const errors = [];
    for (const key of ["AB", "DC", "DE"]) {
      if (!Number.isFinite(data[key]) || data[key] <= 0) {
        errors.push(`${key} debe ser una longitud mayor que cero.`);
      }
    }
    for (const [key, label] of [["angleB", "El ángulo B₁"], ["angleF", "El ángulo F"]]) {
      if (!Number.isFinite(data[key]) || data[key] <= 0 || data[key] >= 90) {
        errors.push(`${label} debe estar entre 0° y 90° para esta figura.`);
      }
    }
    if (data.angleA !== null && (!Number.isFinite(data.angleA) || data.angleA <= 0 || data.angleA >= 180)) {
      errors.push("El ángulo A escrito debe estar entre 0° y 180°, o quedar vacío.");
    }
    return errors;
  }

  function solveGeometry(data) {
    const AC = data.AB * Math.sin(degToRad(data.angleB));
    const CB = data.AB * Math.cos(degToRad(data.angleB));
    const DB = data.DC + CB;
    const AD = Math.hypot(AC, data.DC);
    const EB = Math.hypot(DB, data.DE);

    const angleCAB = 90 - data.angleB;
    const angleDAC = radToDeg(Math.atan2(data.DC, AC));
    const angleA = angleCAB + angleDAC;
    const angleD = 90 + (90 - angleDAC);

    const angleCBE = radToDeg(Math.atan2(data.DE, DB));
    const angleDEB = 90 - angleCBE;
    const angleBEF = 90 - angleDEB;
    const angleEBF = 180 - angleBEF - data.angleF;

    if (angleEBF <= 0 || Math.sin(degToRad(data.angleF)) <= 0) {
      throw new Error("Los ángulos no permiten construir el triángulo EBF.");
    }

    const BF = EB * Math.sin(degToRad(angleBEF)) / Math.sin(degToRad(data.angleF));
    const EF = EB * Math.sin(degToRad(angleEBF)) / Math.sin(degToRad(data.angleF));
    const angleB = data.angleB + angleCBE + angleEBF;
    const angleE = 90;
    const angleSum = angleA + angleB + angleD + angleE + data.angleF;

    const perimeter = data.AB + BF + EF + data.DE + AD;
    const areaADB = DB * AC / 2;
    const areaDEB = DB * data.DE / 2;
    const areaEBF = EB * BF * Math.sin(degToRad(angleEBF)) / 2;
    const area = areaADB + areaDEB + areaEBF;

    const expectedA = data.angleA;
    const differenceA = expectedA === null ? null : Math.abs(expectedA - angleA);

    return {
      data,
      lengths: { AC, CB, DB, AD, EB, BF, EF },
      angles: { angleCAB, angleDAC, angleA, angleD, angleCBE, angleDEB, angleBEF, angleEBF, angleB, angleE, angleF: data.angleF, angleSum },
      perimeter,
      areas: { areaADB, areaDEB, areaEBF, total: area },
      consistency: {
        expectedA,
        calculatedA: angleA,
        differenceA,
        hasWarning: differenceA !== null && differenceA > 0.5
      }
    };
  }

  function createSteps(result) {
    const { data, lengths: l, angles: a, areas } = result;
    return [
      {
        title: "Resolvemos el triángulo ACB",
        known: `AB mide ${formatNumber(data.AB)} cm, el ángulo B₁ mide ${formatNumber(data.angleB)}° y C es un ángulo recto de 90°.`,
        givens: [
          { text: `AB = ${formatNumber(data.AB)} cm`, tone: "blue" },
          { text: `∠B₁ = ${formatNumber(data.angleB)}°`, tone: "orange" },
          { text: "∠C = 90°", tone: "dark" }
        ],
        description: "AB es la hipotenusa porque está frente al ángulo recto. AC queda frente a B₁, por eso usamos seno. CB está junto a B₁, por eso usamos coseno.",
        rule: "sen(B₁) = AC ÷ AB\ncos(B₁) = CB ÷ AB",
        mathRule: String.raw`\operatorname{sen}(B_1)=\frac{AC}{AB}\qquad \cos(B_1)=\frac{CB}{AB}`,
        mathWork: String.raw`\begin{aligned} AC&=AB\cdot\operatorname{sen}(B_1)\\ &=${texNumber(data.AB)}\cdot\operatorname{sen}(${texNumber(data.angleB)}^\circ)\\ &\approx \color{#7352d9}{${texNumber(l.AC)}\ \mathrm{cm}}\\[4pt] CB&=AB\cdot\cos(B_1)\\ &=${texNumber(data.AB)}\cdot\cos(${texNumber(data.angleB)}^\circ)\\ &\approx \color{#7352d9}{${texNumber(l.CB)}\ \mathrm{cm}} \end{aligned}`,
        formula: `AC = AB × sen(B₁)\nAC = ${formatNumber(data.AB)} × sen(${formatNumber(data.angleB)}°) = ${formatNumber(l.AC)} cm\n\nCB = AB × cos(B₁)\nCB = ${formatNumber(data.AB)} × cos(${formatNumber(data.angleB)}°) = ${formatNumber(l.CB)} cm`,
        result: `Ya conocemos los dos catetos: AC ≈ ${formatNumber(l.AC)} cm y CB ≈ ${formatNumber(l.CB)} cm.`,
        highlight: ["lineAB", "lineAC", "lineDB", "angleArcB"],
        measureHighlight: ["AB", "angleB", "AC", "CB"]
      },
      {
        title: "Hallamos AD y el ángulo en D",
        known: `En ACD conocemos los catetos AC ≈ ${formatNumber(l.AC)} cm y DC = ${formatNumber(data.DC)} cm. El ángulo C es de 90°.`,
        givens: [
          { text: `AC ≈ ${formatNumber(l.AC)} cm`, tone: "purple" },
          { text: `DC = ${formatNumber(data.DC)} cm`, tone: "blue" },
          { text: "∠C = 90°", tone: "dark" }
        ],
        description: "Como AD está frente al ángulo recto, es la hipotenusa. La obtenemos con Pitágoras. Luego calculamos el ángulo DAC y lo sumamos con CAB para formar el ángulo completo A.",
        rule: "AD² = AC² + DC²\n∠A = ∠CAB + ∠DAC",
        mathRule: String.raw`AD^2=AC^2+DC^2\qquad \angle A=\angle CAB+\angle DAC`,
        mathWork: String.raw`\begin{aligned} AD&=\sqrt{AC^2+DC^2}\\ &=\sqrt{${texNumber(l.AC)}^2+${texNumber(data.DC)}^2}\\ &\approx \color{#7352d9}{${texNumber(l.AD)}\ \mathrm{cm}}\\[4pt] \angle A&=${texNumber(a.angleCAB)}^\circ+${texNumber(a.angleDAC)}^\circ\\ &\approx \color{#df3f4b}{${texNumber(a.angleA)}^\circ} \end{aligned}`,
        formula: `AD² = AC² + DC²\nAD = √(${formatNumber(l.AC)}² + ${formatNumber(data.DC)}²) = ${formatNumber(l.AD)} cm\n\n∠A = ∠CAB + ∠DAC\n∠A = ${formatNumber(a.angleCAB)}° + ${formatNumber(a.angleDAC)}° = ${formatNumber(a.angleA)}°`,
        result: `El lado exterior AD mide aproximadamente ${formatNumber(l.AD)} cm y el ángulo interior A mide ${formatNumber(a.angleA)}°.`,
        highlight: ["lineDA", "lineAC", "lineDB", "angleArcA"],
        measureHighlight: ["DC", "AC", "AD", "angleA"]
      },
      {
        title: "Resolvemos el triángulo DBE",
        known: `D, C y B están sobre la misma línea. DC = ${formatNumber(data.DC)} cm, CB ≈ ${formatNumber(l.CB)} cm y DE = ${formatNumber(data.DE)} cm.`,
        givens: [
          { text: `DC = ${formatNumber(data.DC)} cm`, tone: "blue" },
          { text: `CB ≈ ${formatNumber(l.CB)} cm`, tone: "purple" },
          { text: `DE = ${formatNumber(data.DE)} cm`, tone: "blue" }
        ],
        description: "Sumamos los dos tramos horizontales para formar DB. Como D es recto, DB y DE son catetos del triángulo DBE; EB es su hipotenusa.",
        rule: "DB = DC + CB\nEB² = DB² + DE²",
        mathRule: String.raw`DB=DC+CB\qquad EB^2=DB^2+DE^2`,
        mathWork: String.raw`\begin{aligned} DB&=${texNumber(data.DC)}+${texNumber(l.CB)}\\ &\approx \color{#7352d9}{${texNumber(l.DB)}\ \mathrm{cm}}\\[4pt] EB&=\sqrt{DB^2+DE^2}\\ &=\sqrt{${texNumber(l.DB)}^2+${texNumber(data.DE)}^2}\\ &\approx \color{#7352d9}{${texNumber(l.EB)}\ \mathrm{cm}} \end{aligned}`,
        formula: `DB = DC + CB\nDB = ${formatNumber(data.DC)} + ${formatNumber(l.CB)} = ${formatNumber(l.DB)} cm\n\nEB² = DB² + DE²\nEB = √(${formatNumber(l.DB)}² + ${formatNumber(data.DE)}²) = ${formatNumber(l.EB)} cm`,
        result: `La diagonal auxiliar EB mide aproximadamente ${formatNumber(l.EB)} cm. La usaremos en el triángulo siguiente.`,
        highlight: ["lineDB", "lineED", "lineEB"],
        measureHighlight: ["DC", "DE", "CB", "DB", "EB"]
      },
      {
        title: "Completamos el triángulo EBF",
        known: `Conocemos EB ≈ ${formatNumber(l.EB)} cm, ∠F = ${formatNumber(data.angleF)}° y, por el triángulo anterior, ∠BEF = ${formatNumber(a.angleBEF)}°.`,
        givens: [
          { text: `EB ≈ ${formatNumber(l.EB)} cm`, tone: "purple" },
          { text: `∠F = ${formatNumber(data.angleF)}°`, tone: "green" },
          { text: `∠BEF ≈ ${formatNumber(a.angleBEF)}°`, tone: "purple" }
        ],
        description: "Primero usamos que los tres ángulos de un triángulo suman 180°. Después aplicamos la ley de los senos: cada lado se relaciona con el seno del ángulo que tiene enfrente.",
        rule: "∠EBF = 180° − ∠BEF − ∠F\nBF ÷ sen(∠BEF) = EB ÷ sen(∠F)",
        mathRule: String.raw`\angle EBF=180^\circ-\angle BEF-\angle F\qquad \frac{BF}{\operatorname{sen}(\angle BEF)}=\frac{EB}{\operatorname{sen}(\angle F)}`,
        mathWork: String.raw`\begin{aligned} \angle EBF&=180^\circ-${texNumber(a.angleBEF)}^\circ-${texNumber(data.angleF)}^\circ\\ &\approx ${texNumber(a.angleEBF)}^\circ\\[4pt] BF&=EB\cdot\frac{\operatorname{sen}(\angle BEF)}{\operatorname{sen}(\angle F)}\\ &\approx \color{#7352d9}{${texNumber(l.BF)}\ \mathrm{cm}}\\[4pt] EF&=EB\cdot\frac{\operatorname{sen}(\angle EBF)}{\operatorname{sen}(\angle F)}\\ &\approx \color{#7352d9}{${texNumber(l.EF)}\ \mathrm{cm}} \end{aligned}`,
        formula: `∠EBF = 180° − ${formatNumber(a.angleBEF)}° − ${formatNumber(data.angleF)}° = ${formatNumber(a.angleEBF)}°\n\nBF / sen(∠BEF) = EB / sen(∠F)\nBF = ${formatNumber(l.BF)} cm\nEF / sen(∠EBF) = EB / sen(∠F)\nEF = ${formatNumber(l.EF)} cm`,
        result: `Los lados exteriores faltantes son BF ≈ ${formatNumber(l.BF)} cm y EF ≈ ${formatNumber(l.EF)} cm.`,
        highlight: ["lineEB", "lineBF", "lineFE", "angleArcF"],
        measureHighlight: ["angleF", "EB", "BF", "EF"]
      },
      {
        title: "Sumamos el perímetro",
        known: `Ya conocemos los cinco lados del borde: AB, BF, FE, ED y DA.`,
        givens: [
          { text: `AB = ${formatNumber(data.AB)} cm`, tone: "blue" },
          { text: `BF ≈ ${formatNumber(l.BF)} cm`, tone: "purple" },
          { text: `EF ≈ ${formatNumber(l.EF)} cm`, tone: "purple" },
          { text: `DE = ${formatNumber(data.DE)} cm`, tone: "blue" },
          { text: `AD ≈ ${formatNumber(l.AD)} cm`, tone: "purple" }
        ],
        description: "El perímetro es la longitud de todo el contorno. No incluimos AC, DB ni EB porque son líneas interiores.",
        rule: "Perímetro = suma de los lados exteriores",
        mathRule: String.raw`P=AB+BF+FE+ED+DA`,
        mathWork: String.raw`\begin{aligned} P&=${texNumber(data.AB)}+${texNumber(l.BF)}+${texNumber(l.EF)}+${texNumber(data.DE)}+${texNumber(l.AD)}\\ &\approx \color{#7352d9}{${texNumber(result.perimeter)}\ \mathrm{cm}} \end{aligned}`,
        formula: `P = AB + BF + FE + ED + DA\nP = ${formatNumber(data.AB)} + ${formatNumber(l.BF)} + ${formatNumber(l.EF)} + ${formatNumber(data.DE)} + ${formatNumber(l.AD)}\nP = ${formatNumber(result.perimeter)} cm`,
        result: `Se necesitan aproximadamente ${formatNumber(result.perimeter)} cm para recorrer todo el borde de la figura.`,
        highlight: ["lineAB", "lineBF", "lineFE", "lineED", "lineDA"],
        measureHighlight: ["AB", "DE", "BF", "EF", "AD"]
      },
      {
        title: "Calculamos el área total",
        known: "La figura quedó dividida sin superposiciones en los triángulos ADB, DEB y EBF.",
        givens: [
          { text: "△ ADB", tone: "blue" },
          { text: "△ DEB", tone: "green" },
          { text: "△ EBF", tone: "orange" }
        ],
        description: "Calculamos el área de cada triángulo y luego las sumamos. Para los rectángulos usamos base × altura ÷ 2; para EBF usamos dos lados y el seno del ángulo comprendido.",
        rule: "Área de triángulo = base × altura ÷ 2\nÁrea total = A₁ + A₂ + A₃",
        mathRule: String.raw`A_{\triangle}=\frac{b\cdot h}{2}\qquad A_{\mathrm{total}}=A_1+A_2+A_3`,
        mathWork: String.raw`\begin{aligned} A_{ADB}&\approx ${texNumber(areas.areaADB)}\ \mathrm{cm^2}\\ A_{DEB}&\approx ${texNumber(areas.areaDEB)}\ \mathrm{cm^2}\\ A_{EBF}&\approx ${texNumber(areas.areaEBF)}\ \mathrm{cm^2}\\[4pt] A_{\mathrm{total}}&=${texNumber(areas.areaADB)}+${texNumber(areas.areaDEB)}+${texNumber(areas.areaEBF)}\\ &\approx \color{#7352d9}{${texNumber(areas.total)}\ \mathrm{cm^2}} \end{aligned}`,
        formula: `Área ADB = DB × AC ÷ 2 = ${formatNumber(areas.areaADB)} cm²\nÁrea DEB = DB × DE ÷ 2 = ${formatNumber(areas.areaDEB)} cm²\nÁrea EBF = EB × BF × sen(∠EBF) ÷ 2 = ${formatNumber(areas.areaEBF)} cm²\n\nÁrea total = ${formatNumber(areas.areaADB)} + ${formatNumber(areas.areaDEB)} + ${formatNumber(areas.areaEBF)} = ${formatNumber(areas.total)} cm²`,
        result: `La superficie completa es aproximadamente ${formatNumber(areas.total)} cm².`,
        highlight: ["outerShape"],
        measureHighlight: ["AC", "DB", "EB", "BF"]
      },
      {
        title: "Comprobamos los ángulos",
        known: "La figura exterior ABFED tiene cinco lados; por lo tanto, es un pentágono.",
        givens: [
          { text: "n = 5 lados", tone: "dark" },
          { text: `∠A ≈ ${formatNumber(a.angleA)}°`, tone: "red" },
          { text: `∠F = ${formatNumber(a.angleF)}°`, tone: "green" }
        ],
        description: "Los ángulos interiores de cualquier pentágono suman (5 − 2) × 180° = 540°. Si nuestra suma coincide, los cálculos son coherentes.",
        rule: "Suma interior = (n − 2) × 180°",
        mathRule: String.raw`S=(n-2)\cdot180^\circ`,
        mathWork: String.raw`\begin{aligned} S_{\mathrm{esperada}}&=(5-2)\cdot180^\circ=540^\circ\\ S_{\mathrm{calculada}}&=${texNumber(a.angleA)}^\circ+${texNumber(a.angleB)}^\circ+${texNumber(a.angleD)}^\circ+90^\circ+${texNumber(a.angleF)}^\circ\\ &=\color{#7352d9}{${texNumber(a.angleSum)}^\circ} \end{aligned}`,
        formula: `Suma esperada = (5 − 2) × 180° = 540°\nSuma calculada = ${formatNumber(a.angleA)}° + ${formatNumber(a.angleB)}° + ${formatNumber(a.angleD)}° + 90,00° + ${formatNumber(a.angleF)}°\nSuma calculada = ${formatNumber(a.angleSum)}°`,
        result: Math.abs(a.angleSum - 540) < 0.05 ? "Comprobación correcta: la suma da 540°, como debe ocurrir en un pentágono." : "La suma no da 540°. Conviene revisar los datos escritos.",
        highlight: ["outerShape", "angleArcA", "angleArcB", "angleArcF"],
        measureHighlight: ["angleA", "angleB", "angleF"]
      }
    ];
  }

  function schematicPoints() {
    return {
      A: { x: 380, y: 65 },
      B: { x: 625, y: 265 },
      C: { x: 380, y: 265 },
      D: { x: 120, y: 265 },
      E: { x: 120, y: 465 },
      F: { x: 665, y: 465 }
    };
  }

  function scaledPoints(result) {
    if (!result) return schematicPoints();
    const { data, lengths: l } = result;
    const raw = {
      A: { x: data.DC, y: -l.AC },
      B: { x: l.DB, y: 0 },
      C: { x: data.DC, y: 0 },
      D: { x: 0, y: 0 },
      E: { x: 0, y: data.DE },
      F: { x: l.EF, y: data.DE }
    };
    const xs = Object.values(raw).map(p => p.x);
    const ys = Object.values(raw).map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const padX = 84, padY = 70;
    const scale = Math.min((760 - padX * 2) / (maxX - minX || 1), (520 - padY * 2) / (maxY - minY || 1));
    return Object.fromEntries(Object.entries(raw).map(([name, p]) => [name, {
      x: padX + (p.x - minX) * scale,
      y: padY + (p.y - minY) * scale
    }]));
  }

  function setLine(id, p1, p2) {
    const line = $("#" + id);
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function addText(group, text, x, y, className, anchor = "middle") {
    const node = svgElement("text", { x, y, class: className, "text-anchor": anchor });
    node.textContent = text;
    group.append(node);
    return node;
  }

  function addEditableMeasure(text, x, y, className, inputKey, anchor = "middle") {
    const node = addText(elements.labels, text, x, y, `${className} editable-measure`, anchor);
    node.dataset.inputKey = inputKey;
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-label", `Editar ${inputKey}: ${text}`);
    return node;
  }

  function addCalculatedMeasure(text, x, y, resultKey, anchor = "middle") {
    const node = addText(elements.labels, text, x, y, "measure-text calculated-measure", anchor);
    node.dataset.resultKey = resultKey;
    return node;
  }

  function midpoint(p1, p2, dx = 0, dy = 0) {
    return { x: (p1.x + p2.x) / 2 + dx, y: (p1.y + p2.y) / 2 + dy };
  }

  function arcPath(vertex, point1, point2, radius) {
    const a1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const a2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);
    let delta = a2 - a1;
    while (delta <= -Math.PI) delta += Math.PI * 2;
    while (delta > Math.PI) delta -= Math.PI * 2;
    const start = { x: vertex.x + Math.cos(a1) * radius, y: vertex.y + Math.sin(a1) * radius };
    const end = { x: vertex.x + Math.cos(a1 + delta) * radius, y: vertex.y + Math.sin(a1 + delta) * radius };
    const sweep = delta > 0 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`;
  }

  function addRightMarker(group, vertex, horizontalDirection, verticalDirection, size = 17) {
    const p1 = { x: vertex.x + horizontalDirection * size, y: vertex.y };
    const p2 = { x: vertex.x + horizontalDirection * size, y: vertex.y + verticalDirection * size };
    const p3 = { x: vertex.x, y: vertex.y + verticalDirection * size };
    const path = svgElement("path", { d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`, class: "right-marker" });
    group.append(path);
  }

  function renderFigure() {
    const p = state.points || (state.toScale ? scaledPoints(state.result) : schematicPoints());
    state.points = p;

    elements.outerShape.setAttribute("points", [p.A, p.B, p.F, p.E, p.D].map(point => `${point.x},${point.y}`).join(" "));
    setLine("lineAB", p.A, p.B);
    setLine("lineBF", p.B, p.F);
    setLine("lineFE", p.F, p.E);
    setLine("lineED", p.E, p.D);
    setLine("lineDA", p.D, p.A);
    setLine("lineAC", p.A, p.C);
    setLine("lineDB", p.D, p.B);
    setLine("lineEB", p.E, p.B);

    elements.pointLayer.replaceChildren();
    const labelOffsets = {
      A: [0, -18], B: [19, 5], C: [0, 28], D: [-20, 7], E: [-20, 8], F: [20, 8]
    };
    Object.entries(p).forEach(([name, point]) => {
      const dot = svgElement("circle", {
        cx: point.x, cy: point.y, r: state.drawMode ? 8 : 5.5,
        class: `point-dot ${state.drawMode ? "is-draggable" : ""}`,
        "data-point": name,
        tabindex: state.drawMode ? 0 : -1,
        role: "button",
        "aria-label": `Punto ${name}`
      });
      elements.pointLayer.append(dot);
      addText(elements.pointLayer, name, point.x + labelOffsets[name][0], point.y + labelOffsets[name][1], "point-label");
    });

    elements.rightAngles.replaceChildren();
    addRightMarker(elements.rightAngles, p.C, -1, -1);
    addRightMarker(elements.rightAngles, p.D, 1, 1);
    addRightMarker(elements.rightAngles, p.E, 1, -1);

    elements.angleArcs.replaceChildren();
    const angleAPath = svgElement("path", { id: "angleArcA", d: arcPath(p.A, p.D, p.B, 43), class: "angle-path a" });
    const angleBPath = svgElement("path", { id: "angleArcB", d: arcPath(p.B, p.A, p.C, 43), class: "angle-path b" });
    const angleFPath = svgElement("path", { id: "angleArcF", d: arcPath(p.F, p.B, p.E, 43), class: "angle-path f" });
    elements.angleArcs.append(angleAPath, angleBPath, angleFPath);

    elements.labels.replaceChildren();
    const data = state.result?.data || readInputsSafe();
    const abLabel = midpoint(p.A, p.B, 28, -12);
    const dcLabel = midpoint(p.D, p.C, 0, -14);
    const deLabel = midpoint(p.D, p.E, -20, 5);
    addEditableMeasure(`${formatNumber(data.AB)} cm`, abLabel.x, abLabel.y, "measure-text", "AB");
    addEditableMeasure(`${formatNumber(data.DC)} cm`, dcLabel.x, dcLabel.y, "measure-text", "DC");
    addEditableMeasure(`${formatNumber(data.DE)} cm`, deLabel.x, deLabel.y, "measure-text", "DE", "end");
    addEditableMeasure(`${formatNumber(data.angleB)}°`, p.B.x - 77, p.B.y - 19, "measure-text angle-b", "angleB");
    addEditableMeasure(`${formatNumber(data.angleF)}°`, p.F.x - 62, p.F.y - 24, "measure-text angle-f", "angleF");
    if (data.angleA !== null && Number.isFinite(data.angleA)) {
      addEditableMeasure(`${formatNumber(data.angleA)}°`, p.A.x, p.A.y + 72, "measure-text angle-a", "angleA");
    } else if (state.result) {
      addText(elements.labels, `${formatNumber(state.result.angles.angleA)}°`, p.A.x, p.A.y + 72, "measure-text angle-a");
    }
    if (state.result) {
      const l = state.result.lengths;
      const adLabel = midpoint(p.A, p.D, -18, -12);
      const bfLabel = midpoint(p.B, p.F, 28, 0);
      const efLabel = midpoint(p.E, p.F, 0, 28);
      const acLabel = midpoint(p.A, p.C, 30, 0);
      const cbLabel = midpoint(p.C, p.B, 0, 27);
      const ebLabel = midpoint(p.E, p.B, 12, -16);
      addCalculatedMeasure(`AD ≈ ${formatNumber(l.AD)} cm`, adLabel.x, adLabel.y, "AD");
      addCalculatedMeasure(`BF ≈ ${formatNumber(l.BF)} cm`, bfLabel.x, bfLabel.y, "BF");
      addCalculatedMeasure(`EF ≈ ${formatNumber(l.EF)} cm`, efLabel.x, efLabel.y, "EF");
      addCalculatedMeasure(`AC ≈ ${formatNumber(l.AC)} cm`, acLabel.x, acLabel.y, "AC", "start");
      addCalculatedMeasure(`CB ≈ ${formatNumber(l.CB)} cm`, cbLabel.x, cbLabel.y, "CB");
      addCalculatedMeasure(`EB ≈ ${formatNumber(l.EB)} cm`, ebLabel.x, ebLabel.y, "EB");
      addCalculatedMeasure(`DB ≈ ${formatNumber(l.DB)} cm`, p.C.x - 65, p.C.y - 42, "DB");
    }

    bindPointDragging();
  }

  function readInputsSafe() {
    const data = readInputs();
    return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, Number.isFinite(data[key]) ? data[key] : fallback]));
  }

  function bindPointDragging() {
    $$(".point-dot", elements.svg).forEach(dot => {
      dot.onpointerdown = event => {
        if (!state.drawMode) return;
        event.preventDefault();
        state.draggedPoint = dot.dataset.point;
        try { elements.svg.setPointerCapture(event.pointerId); } catch (_) { /* no-op */ }
      };
    });
  }

  function clientToSvg(clientX, clientY) {
    const point = elements.svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const matrix = elements.svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : { x: clientX, y: clientY };
  }

  function renderResults(result) {
    const a = result.angles;
    elements.perimeterResult.textContent = `${formatNumber(result.perimeter)} cm`;
    elements.areaResult.textContent = `${formatNumber(result.areas.total)} cm²`;
    elements.angleResults.innerHTML = [
      ["A", a.angleA], ["B", a.angleB], ["D", a.angleD], ["E", a.angleE], ["F", a.angleF], ["Suma", a.angleSum]
    ].map(([label, value]) => `<span>${label === "Suma" ? "" : "∠"}${label} = <strong>${formatNumber(value)}°</strong></span>`).join("");

    const lengthItems = [
      ["AC", result.lengths.AC, "cm"], ["CB", result.lengths.CB, "cm"], ["DB", result.lengths.DB, "cm"],
      ["AD", result.lengths.AD, "cm"], ["EB", result.lengths.EB, "cm"], ["BF", result.lengths.BF, "cm"],
      ["EF", result.lengths.EF, "cm"], ["Área ADB", result.areas.areaADB, "cm²"],
      ["Área DEB", result.areas.areaDEB, "cm²"], ["Área EBF", result.areas.areaEBF, "cm²"]
    ];
    elements.measurementGrid.innerHTML = lengthItems.map(([label, value, unit]) =>
      `<div class="measurement-chip"><strong>${label}</strong> = ${formatNumber(value)} ${unit}</div>`
    ).join("");

    if (result.consistency.hasWarning) {
      elements.consistencyWarning.hidden = false;
      elements.consistencyText.textContent = `Con las longitudes y el ángulo B₁, el ángulo A resulta ${formatNumber(result.consistency.calculatedA)}°, pero se escribió ${formatNumber(result.consistency.expectedA)}°. La diferencia es ${formatNumber(result.consistency.differenceA)}°. Puede haber un número mal leído en la foto o datos redondeados.`;
    } else {
      elements.consistencyWarning.hidden = true;
    }

    elements.resultSubtitle.textContent = "La figura quedó resuelta y comprobada.";
    elements.printButton.disabled = false;
  }

  function renderStep(index) {
    if (!state.steps.length) return;
    state.currentStep = Math.max(0, Math.min(index, state.steps.length - 1));
    const step = state.steps[state.currentStep];
    elements.stepBadge.textContent = `Paso ${state.currentStep + 1} de ${state.steps.length}`;
    elements.stepTitle.textContent = step.title;
    renderKnownChips(step.givens || [{ text: step.known, tone: "dark" }]);
    elements.stepDescription.textContent = step.description;
    renderMath(elements.stepRule, step.mathRule, step.rule);
    renderMath(elements.stepFormula, step.mathWork, step.formula);
    elements.stepResult.textContent = step.result;
    elements.previousStep.disabled = state.currentStep === 0;
    elements.nextStep.disabled = state.currentStep === state.steps.length - 1;
    elements.nextStep.textContent = state.currentStep === state.steps.length - 1 ? "Terminado ✓" : "Siguiente paso →";

    $$(".step-dot", elements.stepDots).forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === state.currentStep));
    $$(".is-step-active", elements.svg).forEach(node => node.classList.remove("is-step-active"));
    step.highlight.forEach(id => $("#" + id)?.classList.add("is-step-active"));
    (step.measureHighlight || []).forEach(key => {
      $$(`[data-input-key="${key}"], [data-result-key="${key}"]`, elements.svg).forEach(node => node.classList.add("is-step-active"));
    });

    updateProgress(state.currentStep >= state.steps.length - 1 ? 4 : 3);
  }

  function renderMath(container, expression, fallback) {
    container.textContent = fallback;
    if (!expression || !window.katex) return;
    try {
      window.katex.render(expression, container, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: false
      });
    } catch (_) {
      container.textContent = fallback;
    }
  }

  function renderKnownChips(givens) {
    elements.stepKnown.replaceChildren();
    givens.forEach(given => {
      const chip = document.createElement("span");
      chip.className = `known-chip tone-${given.tone || "dark"}`;
      chip.textContent = given.text;
      elements.stepKnown.append(chip);
    });
  }

  function renderStepDots() {
    elements.stepDots.replaceChildren();
    state.steps.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "step-dot";
      dot.setAttribute("aria-label", `Ir al paso ${index + 1}`);
      dot.addEventListener("click", () => renderStep(index));
      elements.stepDots.append(dot);
    });
  }

  function updateProgress(active) {
    $$(".progress-step").forEach(step => {
      const number = Number(step.dataset.progress);
      step.classList.toggle("is-active", number === active);
      step.classList.toggle("is-complete", number < active);
    });
  }

  function setFormError(message) {
    elements.formMessage.textContent = message;
    elements.formMessage.hidden = !message;
  }

  function solve(event) {
    event?.preventDefault();
    const data = readInputs();
    const errors = validateData(data);
    if (errors.length) {
      setFormError(errors[0]);
      updateProgress(2);
      return;
    }

    try {
      const result = solveGeometry(data);
      state.result = result;
      state.steps = createSteps(result);
      state.currentStep = 0;
      setFormError("");
      renderResults(result);
      renderStepDots();
      renderStep(0);
      elements.solveButton.innerHTML = '<span aria-hidden="true">↻</span> Recalcular paso a paso';
      elements.previousStep.disabled = true;
      elements.nextStep.disabled = false;
      state.points = state.toScale ? scaledPoints(result) : schematicPoints();
      renderFigure();
      showToast("Figura resuelta. Empezamos por el primer triángulo.");
      $("#explanationPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      setFormError(error.message || "No pudimos resolver la figura con estos datos.");
    }
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
  }

  function switchFigureTab(tab) {
    const showDiagram = tab === "diagram";
    elements.diagramStage.hidden = !showDiagram;
    elements.photoStage.hidden = showDiagram;
    elements.diagramTab.classList.toggle("is-active", showDiagram);
    elements.photoTab.classList.toggle("is-active", !showDiagram);
    elements.diagramTab.setAttribute("aria-selected", String(showDiagram));
    elements.photoTab.setAttribute("aria-selected", String(!showDiagram));
  }

  function resetExample() {
    Object.entries(defaults).forEach(([key, value]) => {
      elements.inputs[key].value = String(value).replace(".", ",");
    });
    state.result = null;
    state.steps = [];
    state.currentStep = 0;
    state.points = schematicPoints();
    state.toScale = false;
    state.drawMode = false;
    state.zoom = 1;
    elements.scaleButton.setAttribute("aria-pressed", "false");
    elements.dragHelper.hidden = true;
    elements.figureModeLabel.textContent = "Esquema claro del ejercicio";
    elements.zoomLayer.style.transform = "scale(1)";
    elements.perimeterResult.textContent = "—";
    elements.areaResult.textContent = "—";
    elements.angleResults.innerHTML = "<span>∠A = —</span><span>∠B = —</span><span>∠D = —</span><span>∠E = —</span><span>∠F = —</span><span>Suma = —</span>";
    elements.measurementGrid.innerHTML = "";
    elements.consistencyWarning.hidden = true;
    elements.resultSubtitle.textContent = "Completá los datos y resolvé el ejercicio.";
    elements.solveButton.innerHTML = '<span aria-hidden="true">▶</span> Resolver paso a paso';
    elements.printButton.disabled = true;
    elements.stepBadge.textContent = "Antes de empezar";
    elements.stepTitle.textContent = "Revisamos los datos";
    renderKnownChips([
      { text: "AB, DC y DE", tone: "blue" },
      { text: "Ángulos dados", tone: "orange" }
    ]);
    elements.stepDescription.textContent = "Vamos a dividir la figura grande en triángulos más sencillos.";
    elements.stepRule.textContent = "Elegimos la relación que conecta los datos con la incógnita.";
    elements.stepFormula.textContent = "Primero identificamos qué triángulo podemos resolver.";
    elements.stepResult.textContent = "Después comprobaremos que el resultado tenga sentido.";
    elements.stepDots.replaceChildren();
    elements.previousStep.disabled = true;
    elements.nextStep.disabled = true;
    setFormError("");
    renderFigure();
    updateProgress(1);
    showToast("Ejemplo reiniciado.");
  }

  function detectPromptData() {
    const text = elements.promptInput.value.replace(/,/g, ".");
    const patterns = {
      AB: /\bAB\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      DC: /\bDC\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      DE: /\bDE\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      angleB: /(?:∠\s*B|ángulo\s+B|angulo\s+B|B₁)\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      angleF: /(?:∠\s*F|ángulo\s+F|angulo\s+F)\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      angleA: /(?:∠\s*A|ángulo\s+A|angulo\s+A)\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i
    };
    let found = 0;
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        elements.inputs[key].value = match[1].replace(".", ",");
        found++;
      }
    });
    state.result = null;
    state.points = schematicPoints();
    renderFigure();
    updateProgress(2);
    showToast(found ? `Detectamos ${found} dato${found === 1 ? "" : "s"}. Revisalos antes de resolver.` : "No encontré medidas con nombre. Probá escribir, por ejemplo: AB = 9,37.");
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Elegí un archivo de imagen válido.");
      return;
    }
    if (state.uploadedImageUrl) URL.revokeObjectURL(state.uploadedImageUrl);
    state.uploadedImageUrl = URL.createObjectURL(file);
    elements.photoThumbnail.src = state.uploadedImageUrl;
    elements.photoViewer.src = state.uploadedImageUrl;
    switchFigureTab("photo");
    showToast("Foto cargada. Usala como referencia para completar los datos.");
  }

  function toggleDrawMode() {
    state.drawMode = !state.drawMode;
    elements.dragHelper.hidden = !state.drawMode;
    elements.figureModeLabel.textContent = state.drawMode ? "Ajustá los puntos arrastrándolos" : (state.toScale ? "Vista proporcional a las medidas" : "Esquema claro del ejercicio");
    renderFigure();
    showToast(state.drawMode ? "Modo ajuste activado." : "Modo ajuste desactivado.");
  }

  function bindSelectableElements() {
    elements.svg.addEventListener("click", event => {
      const editableMeasure = event.target.closest("[data-input-key]");
      if (editableMeasure && !state.drawMode) {
        focusEditableInput(editableMeasure.dataset.inputKey);
        return;
      }
      const target = event.target.closest(".selectable, .point-dot");
      if (!target || state.drawMode) return;
      $$(".is-selected", elements.svg).forEach(node => node.classList.remove("is-selected"));
      target.classList.add("is-selected");
      const name = target.dataset.name || (target.dataset.point ? `Punto ${target.dataset.point}` : "Elemento");
      elements.figureTip.textContent = `${name} resaltado. Las líneas interiores ayudan a dividir la figura, pero no forman parte del perímetro.`;
    });
    elements.svg.addEventListener("keydown", event => {
      const editableMeasure = event.target.closest("[data-input-key]");
      if (editableMeasure && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        focusEditableInput(editableMeasure.dataset.inputKey);
      }
    });
  }

  function focusEditableInput(key) {
    const input = elements.inputs[key];
    if (!input) return;
    $("#dataPanel").scrollIntoView({ behavior: "smooth", block: "center" });
    $$(".data-row").forEach(row => row.classList.toggle("is-editing", row.contains(input)));
    input.focus({ preventScroll: true });
    input.select();
    elements.figureTip.textContent = `Editando ${key}. Escribí la medida correcta y tocá “Recalcular paso a paso”.`;
  }

  function bindEvents() {
    elements.svg.addEventListener("pointermove", event => {
      if (!state.drawMode || !state.draggedPoint) return;
      const point = clientToSvg(event.clientX, event.clientY);
      state.points[state.draggedPoint] = {
        x: Math.max(35, Math.min(725, point.x)),
        y: Math.max(35, Math.min(490, point.y))
      };
      renderFigure();
    });
    elements.svg.addEventListener("pointerup", event => {
      state.draggedPoint = null;
      try { elements.svg.releasePointerCapture(event.pointerId); } catch (_) { /* no-op */ }
    });
    elements.svg.addEventListener("pointercancel", () => { state.draggedPoint = null; });

    elements.form.addEventListener("submit", solve);
    Object.values(elements.inputs).forEach(input => {
      input.addEventListener("focus", () => {
        $$(".data-row").forEach(row => row.classList.toggle("is-editing", row.contains(input)));
      });
      input.addEventListener("input", () => {
        state.result = null;
        state.points = state.toScale ? scaledPoints(null) : schematicPoints();
        renderFigure();
        elements.solveButton.innerHTML = '<span aria-hidden="true">↻</span> Recalcular paso a paso';
        elements.resultSubtitle.textContent = "Cambiaste un dato. Recalculá para actualizar los resultados.";
        updateProgress(2);
      });
    });

    $("#usePhotoButton").addEventListener("click", () => elements.photoInput.click());
    elements.photoInput.addEventListener("change", event => handleFile(event.target.files[0]));
    $("#drawButton").addEventListener("click", toggleDrawMode);
    $("#exampleButton").addEventListener("click", resetExample);
    $("#detectDataButton").addEventListener("click", detectPromptData);

    elements.diagramTab.addEventListener("click", () => switchFigureTab("diagram"));
    elements.photoTab.addEventListener("click", () => switchFigureTab("photo"));

    $("#zoomInButton").addEventListener("click", () => {
      state.zoom = Math.min(1.55, state.zoom + .12);
      elements.zoomLayer.style.transform = `scale(${state.zoom})`;
    });
    $("#zoomOutButton").addEventListener("click", () => {
      state.zoom = Math.max(.7, state.zoom - .12);
      elements.zoomLayer.style.transform = `scale(${state.zoom})`;
    });
    $("#fitButton").addEventListener("click", () => {
      state.zoom = 1;
      elements.zoomLayer.style.transform = "scale(1)";
      state.points = state.toScale ? scaledPoints(state.result) : schematicPoints();
      renderFigure();
    });

    elements.scaleButton.addEventListener("click", () => {
      state.toScale = !state.toScale;
      elements.scaleButton.setAttribute("aria-pressed", String(state.toScale));
      state.points = state.toScale ? scaledPoints(state.result) : schematicPoints();
      elements.figureModeLabel.textContent = state.toScale ? "Vista proporcional a las medidas" : "Esquema claro del ejercicio";
      renderFigure();
      showToast(state.toScale ? "Vista a escala activada." : "Vista esquemática activada.");
    });

    elements.previousStep.addEventListener("click", () => renderStep(state.currentStep - 1));
    elements.nextStep.addEventListener("click", () => renderStep(state.currentStep + 1));
    elements.printButton.addEventListener("click", () => window.print());
    elements.editDataButton.addEventListener("click", () => {
      $("#dataPanel").scrollIntoView({ behavior: "smooth", block: "center" });
      elements.inputs.AB.focus({ preventScroll: true });
      elements.inputs.AB.select();
      showToast("Editá las casillas y después tocá “Recalcular paso a paso”.");
    });

    $$(".progress-step").forEach(step => {
      step.addEventListener("click", () => {
        const number = Number(step.dataset.progress);
        const target = number === 1 ? $("#figurePanel") : number === 2 ? $("#dataPanel") : number === 3 ? $("#explanationPanel") : $("#resultsPanel");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    bindSelectableElements();
  }

  state.points = schematicPoints();
  bindEvents();
  renderFigure();
})();
