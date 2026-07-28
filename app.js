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
    angleA: null,
    AC: null,
    CB: null,
    DB: null,
    AD: null,
    EB: null,
    BF: null,
    EF: null
  };

  const ANGLE_TOLERANCE = 0.05;
  const GIVEN_ANGLE_TOLERANCE = 0.5;

  const lessons = [
    {
      level: "Nivel inicial",
      progress: "Empezamos por lo básico",
      title: "Partes de un triángulo",
      intro: "Un triángulo tiene 3 vértices, 3 lados y 3 ángulos. Las letras mayúsculas nombran los puntos; dos letras juntas nombran el lado que une esos puntos.",
      key: "AB es el lado que va desde A hasta B. ∠A significa “el ángulo que está en A”.",
      formula: "Vértices: A, B, C\nLados: AB, BC, CA\nÁngulos: ∠A, ∠B, ∠C",
      math: "",
      explanation: "Antes de calcular, señalá qué números son lados y cuáles son ángulos. Eso evita usar una fórmula con el dato equivocado.",
      check: "Pregunta rápida: si ves “AC = 6 cm”, ¿qué une? Une el punto A con el punto C.",
      visual: "parts"
    },
    {
      level: "Nivel inicial",
      progress: "Primera regla fundamental",
      title: "Los ángulos suman 180°",
      intro: "Los tres ángulos interiores de cualquier triángulo siempre suman 180°. Si conocemos dos, podemos hallar el tercero con una resta.",
      key: "Dos ángulos no tienen que sumar 180° por sí solos: deben dejar espacio para el tercero.",
      formula: "∠C = 180° − ∠A − ∠B\n∠C = 180° − 50° − 60°\n∠C = 70°",
      math: String.raw`\angle C=180^\circ-50^\circ-60^\circ=70^\circ`,
      explanation: "Si los dos ángulos conocidos ya suman 180° o más, el triángulo es imposible. Si suman menos, la diferencia es el ángulo faltante.",
      check: "Comprobación: 50° + 60° + 70° = 180°. La respuesta tiene sentido.",
      visual: "angles"
    },
    {
      level: "Nivel básico",
      progress: "Calculamos lados",
      title: "Pitágoras en triángulos rectángulos",
      intro: "Un ángulo recto mide 90°. El lado que queda enfrente se llama hipotenusa y siempre es el lado más largo.",
      key: "Pitágoras solo se usa directamente en triángulos rectángulos: hipotenusa² = cateto² + cateto².",
      formula: "c² = a² + b²\nc² = 3² + 4²\nc² = 9 + 16 = 25\nc = 5 cm",
      math: String.raw`c=\sqrt{3^2+4^2}=5\ \mathrm{cm}`,
      explanation: "Primero elevamos cada cateto al cuadrado, sumamos y finalmente calculamos la raíz cuadrada.",
      check: "Control útil: la hipotenusa 5 cm es mayor que los catetos 3 cm y 4 cm.",
      visual: "pythagoras"
    },
    {
      level: "Nivel intermedio",
      progress: "Relacionamos lados y ángulos",
      title: "Seno, coseno y tangente",
      intro: "Estas razones permiten conectar un ángulo con los lados de un triángulo rectángulo. Siempre se nombran respecto del ángulo que estamos mirando.",
      key: "SOH–CAH–TOA: seno = opuesto/hipotenusa; coseno = adyacente/hipotenusa; tangente = opuesto/adyacente.",
      formula: "sen(θ) = opuesto ÷ hipotenusa\ncos(θ) = adyacente ÷ hipotenusa\ntan(θ) = opuesto ÷ adyacente",
      math: String.raw`\begin{aligned}\operatorname{sen}(\theta)&=\frac{\mathrm{opuesto}}{\mathrm{hipotenusa}}\\[4pt]\cos(\theta)&=\frac{\mathrm{adyacente}}{\mathrm{hipotenusa}}\\[4pt]\tan(\theta)&=\frac{\mathrm{opuesto}}{\mathrm{adyacente}}\end{aligned}`,
      explanation: "Marcá el ángulo θ. El lado que no lo toca es el opuesto; el cateto que sí lo toca es el adyacente.",
      check: "No memorices solo letras: mirá el dibujo y nombrá primero hipotenusa, opuesto y adyacente.",
      visual: "trig"
    },
    {
      level: "Nivel intermedio",
      progress: "Unimos varios triángulos",
      title: "Figuras compuestas y perímetro",
      intro: "Una figura difícil se vuelve más fácil cuando la dividimos en triángulos conocidos. Cada resultado puede convertirse en un dato para el triángulo siguiente.",
      key: "Para el perímetro sumamos únicamente los lados del contorno. Las líneas interiores ayudan a calcular, pero no se suman.",
      formula: "P = AB + BF + FE + ED + DA",
      math: String.raw`P=AB+BF+FE+ED+DA`,
      explanation: "Recorré el borde con el dedo. Si una línea queda dentro de la figura, como AC o EB, no pertenece al perímetro.",
      check: "Estrategia: resolvé primero el triángulo con más datos y avanzá hacia los demás.",
      visual: "compound"
    },
    {
      level: "Nivel avanzado",
      progress: "Resolvemos y comprobamos",
      title: "Área y comprobación final",
      intro: "El área mide la superficie interior. En una figura compuesta calculamos cada región sin superponerlas y luego sumamos.",
      key: "Una respuesta completa incluye unidades: longitudes en cm y áreas en cm².",
      formula: "Área del triángulo = base × altura ÷ 2\nÁrea total = A₁ + A₂ + A₃",
      math: String.raw`\begin{aligned}A_{\triangle}&=\frac{b\cdot h}{2}\\[4pt]A_{\mathrm{total}}&=A_1+A_2+A_3\end{aligned}`,
      explanation: "Al terminar, comprobá ángulos, longitudes posibles, unidades y si el resultado coincide aproximadamente con el dibujo.",
      check: "Ya podés volver al solucionador: GeoPaso te mostrará estas mismas ideas aplicadas a tu ejercicio.",
      visual: "area"
    }
  ];

  const state = {
    result: null,
    steps: [],
    currentStep: 0,
    zoom: 1,
    toScale: false,
    drawMode: false,
    mobileScreen: 1,
    learningLesson: 0,
    points: null,
    draggedPoint: null,
    inlineEditKey: null,
    activePointers: new Map(),
    pinchStartDistance: 0,
    pinchStartZoom: 1,
    pinchActive: false,
    pinchStartMidpoint: null,
    pinchStartPanX: 0,
    pinchStartPanY: 0,
    panX: 0,
    panY: 0,
    singlePan: null,
    panActive: false,
    suppressNextClick: false,
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
      angleA: $("#inputA"),
      AC: $("#inputAC"),
      CB: $("#inputCB"),
      DB: $("#inputDB"),
      AD: $("#inputAD"),
      EB: $("#inputEB"),
      BF: $("#inputBF"),
      EF: $("#inputEF")
    },
    svg: $("#geometrySvg"),
    zoomLayer: $("#zoomLayer"),
    pointLayer: $("#pointLayer"),
    inlineMeasureEditor: $("#inlineMeasureEditor"),
    inlineMeasureLabel: $("#inlineMeasureLabel"),
    inlineMeasureInput: $("#inlineMeasureInput"),
    inlineMeasureUnit: $("#inlineMeasureUnit"),
    inlineMeasureSave: $("#inlineMeasureSave"),
    inlineMeasureCancel: $("#inlineMeasureCancel"),
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
    stepVisualCard: $("#stepVisualCard"),
    stepVisualCaption: $("#stepVisualCaption"),
    stepDots: $("#stepDots"),
    previousStep: $("#previousStepButton"),
    nextStep: $("#nextStepButton"),
    scaleButton: $("#scaleButton"),
    editDataButton: $("#editDataButton"),
    mobileWizardNav: $("#mobileWizardNav"),
    mobileBackButton: $("#mobileBackButton"),
    mobileNextButton: $("#mobileNextButton"),
    mobileStepCount: $("#mobileStepCount"),
    mobileStepName: $("#mobileStepName"),
    mobileAdjustButton: $("#mobileAdjustButton"),
    learningPanel: $("#learningPanel"),
    learnModeButton: $("#learnModeButton"),
    exitLearningButton: $("#exitLearningButton"),
    lessonCounter: $("#lessonCounter"),
    lessonProgressText: $("#lessonProgressText"),
    learningProgress: $("#learningProgress"),
    lessonVisual: $("#lessonVisual"),
    lessonLevel: $("#lessonLevel"),
    lessonTitle: $("#lessonTitle"),
    lessonIntro: $("#lessonIntro"),
    lessonKey: $("#lessonKey"),
    lessonFormula: $("#lessonFormula"),
    lessonExplanation: $("#lessonExplanation"),
    lessonCheck: $("#lessonCheck"),
    previousLessonButton: $("#previousLessonButton"),
    nextLessonButton: $("#nextLessonButton"),
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
    if (!clean) return optional ? null : NaN;
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
    return Object.fromEntries(Object.entries(elements.inputs).map(([key, input]) => [key, parseLocaleNumber(input.value, true)]));
  }

  function isKnown(value) {
    return Number.isFinite(value) && value > 0;
  }

  function dataIssue(type, message) {
    return { type, message };
  }

  function valuesMatch(written, calculated, isAngle = false) {
    const tolerance = isAngle ? GIVEN_ANGLE_TOLERANCE : Math.max(0.05, Math.abs(calculated) * 0.005);
    return Math.abs(written - calculated) <= tolerance;
  }

  function completeGeometryData(raw) {
    const preparationNotes = [];
    const lengthKeys = ["AB", "DC", "DE", "AC", "CB", "DB", "AD", "EB", "BF", "EF"];
    for (const key of lengthKeys) {
      if (raw[key] !== null && (!Number.isFinite(raw[key]) || raw[key] <= 0)) {
        return { issue: dataIssue("error", `${key} debe ser una longitud mayor que cero. Revisá la coma decimal o un posible signo menos.`) };
      }
    }
    for (const [key, label, maximum] of [["angleB", "B₁", 90], ["angleF", "F", 90], ["angleA", "A", 180]]) {
      if (raw[key] !== null && (!Number.isFinite(raw[key]) || raw[key] <= 0 || raw[key] >= maximum)) {
        const explanation = key === "angleB"
          ? "C ya mide 90°; si B₁ mide 90° o más, esos dos ángulos solos ya suman 180° o más y no queda lugar para el tercero."
          : `El ángulo ${label} debe estar entre 0° y ${maximum}° para esta figura.`;
        return { issue: dataIssue("error", `${explanation} Revisá el número o el ángulo elegido.`) };
      }
    }

    let AB, AC, CB, angleB;
    if (isKnown(raw.AB) && isKnown(raw.angleB)) {
      AB = raw.AB; angleB = raw.angleB;
      AC = AB * Math.sin(degToRad(angleB));
      CB = AB * Math.cos(degToRad(angleB));
    } else if (isKnown(raw.AC) && isKnown(raw.CB)) {
      AC = raw.AC; CB = raw.CB;
      AB = Math.hypot(AC, CB);
      angleB = radToDeg(Math.atan2(AC, CB));
      preparationNotes.push(`Con AC y CB usamos Pitágoras para hallar AB, y luego calculamos B₁.`);
    } else if (isKnown(raw.AB) && isKnown(raw.AC)) {
      if (raw.AC >= raw.AB) return { issue: dataIssue("error", "En el triángulo ACB, AB es la hipotenusa y debe ser mayor que AC.") };
      AB = raw.AB; AC = raw.AC;
      CB = Math.sqrt(AB ** 2 - AC ** 2);
      angleB = radToDeg(Math.asin(AC / AB));
      preparationNotes.push(`Con AB y AC usamos Pitágoras para hallar CB, y luego calculamos B₁.`);
    } else if (isKnown(raw.AB) && isKnown(raw.CB)) {
      if (raw.CB >= raw.AB) return { issue: dataIssue("error", "En el triángulo ACB, AB es la hipotenusa y debe ser mayor que CB.") };
      AB = raw.AB; CB = raw.CB;
      AC = Math.sqrt(AB ** 2 - CB ** 2);
      angleB = radToDeg(Math.acos(CB / AB));
      preparationNotes.push(`Con AB y CB usamos Pitágoras para hallar AC, y luego calculamos B₁.`);
    } else if (isKnown(raw.AC) && isKnown(raw.angleB)) {
      AC = raw.AC; angleB = raw.angleB;
      AB = AC / Math.sin(degToRad(angleB));
      CB = AB * Math.cos(degToRad(angleB));
      preparationNotes.push(`Con AC y B₁ calculamos primero la hipotenusa AB y después CB.`);
    } else if (isKnown(raw.CB) && isKnown(raw.angleB)) {
      CB = raw.CB; angleB = raw.angleB;
      AB = CB / Math.cos(degToRad(angleB));
      AC = AB * Math.sin(degToRad(angleB));
      preparationNotes.push(`Con CB y B₁ calculamos primero la hipotenusa AB y después AC.`);
    } else {
      return { issue: dataIssue("incomplete", "Faltan datos en el triángulo ACB. Escribí dos datos independientes: por ejemplo AB y B₁, dos lados, o un cateto y B₁.") };
    }

    let DC;
    const angleCAB = 90 - angleB;
    if (isKnown(raw.DC)) {
      DC = raw.DC;
    } else if (isKnown(raw.AD)) {
      if (raw.AD <= AC) return { issue: dataIssue("error", "AD es la hipotenusa del triángulo ACD y debe ser mayor que AC.") };
      DC = Math.sqrt(raw.AD ** 2 - AC ** 2);
      preparationNotes.push(`Como AD es dato, usamos DC = √(AD² − AC²).`);
    } else if (isKnown(raw.DB)) {
      DC = raw.DB - CB;
      if (DC <= 0) return { issue: dataIssue("error", "DB debe ser mayor que CB porque DB = DC + CB.") };
      preparationNotes.push(`Como DB es dato, usamos DC = DB − CB.`);
    } else if (isKnown(raw.angleA)) {
      const angleDAC = raw.angleA - angleCAB;
      if (angleDAC <= 0 || angleDAC >= 90) {
        return { issue: dataIssue("error", `Con B₁ = ${formatNumber(angleB)}°, el ángulo A no puede ser ${formatNumber(raw.angleA)}°. Revisá si A corresponde al ángulo completo.`) };
      }
      DC = AC * Math.tan(degToRad(angleDAC));
      preparationNotes.push(`Con el ángulo A hallamos ∠DAC y usamos tangente para calcular DC.`);
    } else {
      return { issue: dataIssue("incomplete", "Ya resolvimos ACB, pero falta ubicar el punto D. Escribí DC, AD, DB o el ángulo A.") };
    }

    const AD = Math.hypot(AC, DC);
    const DB = DC + CB;
    let DE;
    if (isKnown(raw.DE)) {
      DE = raw.DE;
    } else if (isKnown(raw.EB)) {
      if (raw.EB <= DB) return { issue: dataIssue("error", "EB es la hipotenusa del triángulo DBE y debe ser mayor que DB.") };
      DE = Math.sqrt(raw.EB ** 2 - DB ** 2);
      preparationNotes.push(`Como EB es dato, usamos DE = √(EB² − DB²).`);
    } else {
      return { issue: dataIssue("incomplete", "Falta ubicar el punto E. Escribí DE o la diagonal EB.") };
    }

    const EB = Math.hypot(DB, DE);
    let angleF, EF, BF;
    if (isKnown(raw.angleF)) {
      angleF = raw.angleF;
      const horizontalBF = DE / Math.tan(degToRad(angleF));
      EF = DB + horizontalBF;
      BF = Math.hypot(horizontalBF, DE);
    } else if (isKnown(raw.EF)) {
      EF = raw.EF;
      const horizontalBF = EF - DB;
      if (horizontalBF <= 0) return { issue: dataIssue("error", "Para esta figura, EF debe llegar más a la derecha que B; por eso EF debe ser mayor que DB.") };
      BF = Math.hypot(horizontalBF, DE);
      angleF = radToDeg(Math.atan2(DE, horizontalBF));
      preparationNotes.push(`Como EF es dato, usamos la diferencia horizontal EF − DB para calcular BF y el ángulo F.`);
    } else if (isKnown(raw.BF)) {
      BF = raw.BF;
      if (BF <= DE) return { issue: dataIssue("error", "BF debe ser mayor que la altura DE para alcanzar el punto F en esta figura.") };
      const horizontalBF = Math.sqrt(BF ** 2 - DE ** 2);
      EF = DB + horizontalBF;
      angleF = radToDeg(Math.atan2(DE, horizontalBF));
      preparationNotes.push(`Como BF es dato, usamos Pitágoras para hallar su avance horizontal; después calculamos EF y el ángulo F.`);
    } else {
      return { issue: dataIssue("incomplete", "Falta ubicar el punto F. Escribí el ángulo F, el lado BF o el lado EF.") };
    }

    const calculated = { AB, AC, CB, DC, DB, AD, DE, EB, BF, EF, angleB, angleF };
    for (const key of Object.keys(calculated)) {
      if (isKnown(raw[key]) && !valuesMatch(raw[key], calculated[key], key.startsWith("angle"))) {
        const unit = key.startsWith("angle") ? "°" : " cm";
        return { issue: dataIssue("error", `${key === "angleB" ? "B₁" : key === "angleF" ? "F" : key} = ${formatNumber(raw[key])}${unit} contradice a los demás datos; debería ser aproximadamente ${formatNumber(calculated[key])}${unit}. Revisá qué número fue copiado o detectado incorrectamente.`) };
      }
    }

    const calculatedA = angleCAB + radToDeg(Math.atan2(DC, AC));
    if (isKnown(raw.angleA) && !valuesMatch(raw.angleA, calculatedA, true)) {
      return { issue: dataIssue("error", `A = ${formatNumber(raw.angleA)}° contradice a los demás datos; debería ser aproximadamente ${formatNumber(calculatedA)}°. Revisá A, B₁ o las longitudes cercanas.`) };
    }

    return {
      data: {
        AB, DC, DE, angleB, angleF,
        angleA: raw.angleA,
        given: Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, isKnown(value)])),
        preparationNotes
      }
    };
  }

  function triangleError(name, sides, angles) {
    if (sides.some(side => !Number.isFinite(side) || side <= 0)) {
      return `El triángulo ${name} produce una longitud imposible. Revisá que las medidas estén completas y sean mayores que cero.`;
    }

    if (angles.some(angle => !Number.isFinite(angle) || angle <= ANGLE_TOLERANCE || angle >= 180 - ANGLE_TOLERANCE)) {
      return `El triángulo ${name} queda aplastado o tiene un ángulo imposible. Revisá los ángulos escritos.`;
    }

    const angleSum = angles.reduce((sum, angle) => sum + angle, 0);
    if (Math.abs(angleSum - 180) > ANGLE_TOLERANCE) {
      return `Los ángulos del triángulo ${name} suman ${formatNumber(angleSum)}°. Deben sumar 180°. Revisá los ángulos escritos.`;
    }

    const [a, b, c] = [...sides].sort((left, right) => left - right);
    if (a + b <= c) {
      return `Las longitudes del triángulo ${name} no pueden formar un triángulo: los dos lados menores deben sumar más que el mayor.`;
    }

    return "";
  }

  function validateSolvedGeometry(result) {
    const { data, lengths: l, angles: a } = result;
    const checks = [
      triangleError("ACB", [l.AC, l.CB, data.AB], [a.angleCAB, data.angleB, 90]),
      triangleError("ACD", [l.AC, data.DC, l.AD], [a.angleDAC, 90, 90 - a.angleDAC]),
      triangleError("DBE", [l.DB, data.DE, l.EB], [90, a.angleCBE, a.angleDEB]),
      triangleError("EBF", [l.EB, l.BF, l.EF], [a.angleBEF, a.angleEBF, data.angleF])
    ];
    const triangleProblem = checks.find(Boolean);
    if (triangleProblem) return triangleProblem;

    if (!Number.isFinite(result.perimeter) || !Number.isFinite(result.areas.total)) {
      return "Las medidas producen un resultado demasiado grande o imposible de calcular. Revisá si agregaste cifras de más.";
    }

    if (Math.abs(a.angleSum - 540) > ANGLE_TOLERANCE) {
      return `Los ángulos de la figura suman ${formatNumber(a.angleSum)}°. Un pentágono debe sumar 540°. Revisá los datos escritos.`;
    }

    if (result.consistency.differenceA !== null && result.consistency.differenceA > GIVEN_ANGLE_TOLERANCE) {
      return `El ángulo A escrito (${formatNumber(result.consistency.expectedA)}°) contradice a las demás medidas: debería ser aproximadamente ${formatNumber(result.consistency.calculatedA)}°. Revisá A, B₁, AB o DC. Si A es la incógnita, dejá esa casilla vacía.`;
    }

    return "";
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
    const steps = [
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
        description: "Calculamos el área de cada triángulo y luego las sumamos. Para los triángulos rectángulos usamos base × altura ÷ 2; para EBF usamos dos lados y el seno del ángulo comprendido.",
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
    if (!data.preparationNotes?.length) return steps;
    return [{
      title: "Completamos los datos equivalentes",
      known: "El ejercicio dio una combinación diferente de medidas, pero suficiente para reconstruir la misma figura.",
      givens: [{ text: "Datos ingresados manualmente", tone: "blue" }],
      description: "Antes del procedimiento principal, transformamos esos datos con relaciones válidas de los triángulos. No inventamos ninguna medida.",
      rule: "Usamos Pitágoras, razones trigonométricas y sumas o restas de segmentos.",
      mathRule: "",
      mathWork: "",
      formula: data.preparationNotes.join("\n\n"),
      result: "Ya tenemos la información equivalente necesaria para continuar paso a paso.",
      highlight: ["outerShape"],
      measureHighlight: Object.keys(data.given || {}).filter(key => data.given[key])
    }, ...steps];
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
    const missing = text.includes("?");
    const node = addText(elements.labels, text, x, y, `${className} editable-measure ${missing ? "is-missing" : ""}`, anchor);
    node.dataset.inputKey = inputKey;
    node.dataset.missing = String(missing);
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-label", missing ? `Falta ${inputKey}. Tocar para escribir el dato.` : `Editar ${inputKey}: ${text}`);
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

  function inputMeasureText(label, value, unit) {
    return Number.isFinite(value) ? `${label} = ${formatNumber(value)}${unit}` : `${label} = ?${unit}`;
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
    addText(elements.rightAngles, "90°", p.C.x - 39, p.C.y - 25, "right-angle-text");
    addText(elements.rightAngles, "90°", p.D.x + 42, p.D.y + 35, "right-angle-text");
    addText(elements.rightAngles, "90°", p.E.x + 42, p.E.y - 20, "right-angle-text");

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
    addEditableMeasure(inputMeasureText("AB", data.AB, " cm"), abLabel.x, abLabel.y, "measure-text", "AB");
    addEditableMeasure(inputMeasureText("DC", data.DC, " cm"), dcLabel.x, dcLabel.y, "measure-text", "DC");
    addEditableMeasure(inputMeasureText("DE", data.DE, " cm"), deLabel.x, deLabel.y, "measure-text", "DE", "end");
    addEditableMeasure(inputMeasureText("B₁", data.angleB, "°"), p.B.x - 77, p.B.y - 19, "measure-text angle-b", "angleB");
    addEditableMeasure(inputMeasureText("F", data.angleF, "°"), p.F.x - 62, p.F.y - 24, "measure-text angle-f", "angleF");
    if (data.angleA !== null && Number.isFinite(data.angleA)) {
      addEditableMeasure(inputMeasureText("A", data.angleA, "°"), p.A.x, p.A.y + 72, "measure-text angle-a", "angleA");
    } else if (state.result) {
      addEditableMeasure(`A ≈ ${formatNumber(state.result.angles.angleA)}°`, p.A.x, p.A.y + 72, "measure-text angle-a calculated-measure", "angleA");
    } else {
      addEditableMeasure("A = ?°", p.A.x, p.A.y + 72, "measure-text angle-a", "angleA");
    }
    if (state.result) {
      const l = state.result.lengths;
      const adLabel = midpoint(p.A, p.D, -18, -12);
      const bfLabel = midpoint(p.B, p.F, 28, 0);
      const efLabel = midpoint(p.E, p.F, 0, 28);
      const acLabel = midpoint(p.A, p.C, 30, 0);
      const cbLabel = midpoint(p.C, p.B, 0, 27);
      const ebLabel = midpoint(p.E, p.B, 12, -16);
      addEditableMeasure(`AD ≈ ${formatNumber(l.AD)} cm`, adLabel.x, adLabel.y, "measure-text calculated-measure", "AD");
      addEditableMeasure(`BF ≈ ${formatNumber(l.BF)} cm`, bfLabel.x, bfLabel.y, "measure-text calculated-measure", "BF");
      addEditableMeasure(`EF ≈ ${formatNumber(l.EF)} cm`, efLabel.x, efLabel.y, "measure-text calculated-measure", "EF");
      addEditableMeasure(`AC ≈ ${formatNumber(l.AC)} cm`, acLabel.x, acLabel.y, "measure-text calculated-measure", "AC", "start");
      addEditableMeasure(`CB ≈ ${formatNumber(l.CB)} cm`, cbLabel.x, cbLabel.y, "measure-text calculated-measure", "CB");
      addEditableMeasure(`EB ≈ ${formatNumber(l.EB)} cm`, ebLabel.x, ebLabel.y, "measure-text calculated-measure", "EB");
      addEditableMeasure(`DB ≈ ${formatNumber(l.DB)} cm`, p.C.x - 65, p.C.y - 42, "measure-text calculated-measure", "DB");
    } else {
      const pendingLabels = [
        [inputMeasureText("AD", data.AD, " cm"), midpoint(p.A, p.D, -18, -12), "AD"],
        [inputMeasureText("BF", data.BF, " cm"), midpoint(p.B, p.F, 28, 0), "BF"],
        [inputMeasureText("EF", data.EF, " cm"), midpoint(p.E, p.F, 0, 28), "EF"],
        [inputMeasureText("AC", data.AC, " cm"), midpoint(p.A, p.C, 30, 0), "AC", "start"],
        [inputMeasureText("CB", data.CB, " cm"), midpoint(p.C, p.B, 0, 27), "CB"],
        [inputMeasureText("EB", data.EB, " cm"), midpoint(p.E, p.B, 12, -16), "EB"],
        [inputMeasureText("DB", data.DB, " cm"), { x: p.C.x - 65, y: p.C.y - 42 }, "DB"]
      ];
      pendingLabels.forEach(([text, position, key, anchor]) => {
        const node = addEditableMeasure(text, position.x, position.y, "measure-text calculated-measure", key, anchor || "middle");
        if (text.includes("?")) node.classList.add("pending-measure");
      });
    }

    bindPointDragging();
  }

  function readInputsSafe() {
    return readInputs();
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
    renderStepVisual(step);
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
    updateMobileWizardControls();
  }

  function renderStepVisual(step) {
    const title = step.title.toLowerCase();
    let mode = "area";
    let caption = "La figura completa y sus triángulos auxiliares.";
    if (title.includes("acb")) {
      mode = "acb";
      caption = "Trabajamos solamente con △ACB, resaltado en azul.";
    } else if (title.includes("ad y") || title.includes("acd")) {
      mode = "acd";
      caption = "Ahora miramos △ACD, resaltado en rojo.";
    } else if (title.includes("dbe")) {
      mode = "dbe";
      caption = "Usamos △DBE, resaltado en verde.";
    } else if (title.includes("ebf")) {
      mode = "ebf";
      caption = "Usamos △EBF, resaltado en naranja.";
    } else if (title.includes("perímetro")) {
      mode = "perimeter";
      caption = "Solo sumamos el borde exterior violeta.";
    } else if (title.includes("área")) {
      mode = "area";
      caption = "Sumamos las regiones coloreadas sin superponerlas.";
    } else if (title.includes("ángulos")) {
      mode = "angles";
      caption = "Comprobamos los cinco ángulos del contorno.";
    }
    elements.stepVisualCard.className = `step-visual-card mode-${mode}`;
    elements.stepVisualCaption.textContent = caption;
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

  function lessonVisualMarkup(type) {
    const commonStart = '<svg viewBox="0 0 360 300" role="img" aria-label="Ejemplo visual de la lección" xmlns="http://www.w3.org/2000/svg">';
    const commonEnd = '</svg>';
    const visuals = {
      parts: `${commonStart}
        <polygon points="180,36 48,248 318,248" fill="#e7f0ff" stroke="#2468f2" stroke-width="6" stroke-linejoin="round"/>
        <circle cx="180" cy="36" r="9" fill="#7352d9"/><circle cx="48" cy="248" r="9" fill="#7352d9"/><circle cx="318" cy="248" r="9" fill="#7352d9"/>
        <g fill="#263653" font-family="system-ui" font-size="22" font-weight="800"><text x="180" y="25" text-anchor="middle">A</text><text x="27" y="273">B</text><text x="323" y="273">C</text></g>
        <g fill="#2468f2" font-family="system-ui" font-size="17" font-weight="750"><text x="100" y="137" transform="rotate(-58 100 137)">lado AB</text><text x="226" y="140" transform="rotate(58 226 140)">lado AC</text><text x="183" y="276" text-anchor="middle">lado BC</text></g>
        <path d="M73 248 A25 25 0 0 1 62 227" fill="none" stroke="#ed8b21" stroke-width="6"/><text x="79" y="228" fill="#a9600d" font-family="system-ui" font-size="17" font-weight="800">∠B</text>
      ${commonEnd}`,
      angles: `${commonStart}
        <polygon points="180,35 43,252 322,252" fill="#fff" stroke="#34425e" stroke-width="5" stroke-linejoin="round"/>
        <path d="M153 78 A48 48 0 0 1 207 78" fill="none" stroke="#7352d9" stroke-width="8"/><path d="M78 252 A35 35 0 0 1 62 220" fill="none" stroke="#2468f2" stroke-width="8"/><path d="M286 252 A36 36 0 0 1 306 219" fill="none" stroke="#ed8b21" stroke-width="8"/>
        <g font-family="system-ui" font-size="20" font-weight="850"><text x="180" y="96" text-anchor="middle" fill="#7352d9">70°</text><text x="82" y="226" fill="#2468f2">50°</text><text x="258" y="226" fill="#b66a14">60°</text></g>
        <rect x="69" y="268" width="222" height="28" rx="14" fill="#e8f7f1"/><text x="180" y="288" text-anchor="middle" fill="#137452" font-family="system-ui" font-size="16" font-weight="850">50° + 60° + 70° = 180°</text>
      ${commonEnd}`,
      pythagoras: `${commonStart}
        <polygon points="70,242 70,70 294,242" fill="#e8f7f1" stroke="#129a68" stroke-width="6" stroke-linejoin="round"/><path d="M70 215 L97 215 L97 242" fill="none" stroke="#34425e" stroke-width="5"/>
        <g font-family="system-ui" font-size="21" font-weight="850"><text x="44" y="162" fill="#2468f2">3</text><text x="177" y="273" fill="#ed8b21">4</text><text x="200" y="143" transform="rotate(38 200 143)" fill="#7352d9">5 (hipotenusa)</text></g>
        <text x="180" y="35" text-anchor="middle" fill="#263653" font-family="system-ui" font-size="19" font-weight="850">3² + 4² = 5²</text>
      ${commonEnd}`,
      trig: `${commonStart}
        <polygon points="58,246 58,63 314,246" fill="#fff" stroke="#34425e" stroke-width="5" stroke-linejoin="round"/><path d="M58 219 L85 219 L85 246" fill="none" stroke="#34425e" stroke-width="4"/><path d="M273 246 A42 42 0 0 1 280 222" fill="none" stroke="#7352d9" stroke-width="7"/>
        <text x="276" y="220" fill="#7352d9" font-family="system-ui" font-size="24" font-weight="850">θ</text><text x="31" y="157" fill="#2468f2" font-family="system-ui" font-size="18" font-weight="850" transform="rotate(-90 31 157)">opuesto</text><text x="178" y="275" text-anchor="middle" fill="#ed8b21" font-family="system-ui" font-size="18" font-weight="850">adyacente</text><text x="190" y="137" fill="#129a68" font-family="system-ui" font-size="18" font-weight="850" transform="rotate(36 190 137)">hipotenusa</text>
      ${commonEnd}`,
      compound: `${commonStart}
        <polygon points="174,33 302,145 326,259 55,259 55,145" fill="#f7f3ff" stroke="#7352d9" stroke-width="8" stroke-linejoin="round"/>
        <line x1="174" y1="33" x2="174" y2="145" stroke="#9aa8be" stroke-width="4" stroke-dasharray="8 7"/><line x1="55" y1="145" x2="302" y2="145" stroke="#9aa8be" stroke-width="4" stroke-dasharray="8 7"/><line x1="55" y1="259" x2="302" y2="145" stroke="#9aa8be" stroke-width="4" stroke-dasharray="8 7"/>
        <text x="180" y="292" text-anchor="middle" fill="#7352d9" font-family="system-ui" font-size="17" font-weight="850">Perímetro = solo el borde violeta</text>
      ${commonEnd}`,
      area: `${commonStart}
        <polygon points="174,33 174,145 55,145" fill="#efc9ce" stroke="#df3f4b" stroke-width="3"/><polygon points="174,33 302,145 174,145" fill="#c9dbff" stroke="#2468f2" stroke-width="3"/><polygon points="55,145 302,145 55,259" fill="#c6eadc" stroke="#129a68" stroke-width="3"/><polygon points="55,259 302,145 326,259" fill="#f8dfb9" stroke="#ed8b21" stroke-width="3"/>
        <polygon points="174,33 302,145 326,259 55,259 55,145" fill="none" stroke="#34425e" stroke-width="5" stroke-linejoin="round"/>
        <g fill="#263653" font-family="system-ui" font-size="18" font-weight="850"><text x="115" y="112">A₁</text><text x="228" y="112">A₂</text><text x="112" y="196">A₃</text><text x="250" y="226">A₄</text></g><text x="180" y="292" text-anchor="middle" fill="#263653" font-family="system-ui" font-size="17" font-weight="850">Área total = A₁ + A₂ + A₃ + A₄</text>
      ${commonEnd}`
    };
    return visuals[type] || visuals.parts;
  }

  function renderLesson(index) {
    state.learningLesson = Math.max(0, Math.min(index, lessons.length - 1));
    const lesson = lessons[state.learningLesson];
    elements.lessonCounter.textContent = `Lección ${state.learningLesson + 1} de ${lessons.length}`;
    elements.lessonProgressText.textContent = lesson.progress;
    elements.lessonVisual.innerHTML = lessonVisualMarkup(lesson.visual);
    elements.lessonLevel.textContent = lesson.level;
    elements.lessonTitle.textContent = lesson.title;
    elements.lessonIntro.textContent = lesson.intro;
    elements.lessonKey.textContent = lesson.key;
    renderMath(elements.lessonFormula, lesson.math, lesson.formula);
    elements.lessonExplanation.textContent = lesson.explanation;
    elements.lessonCheck.textContent = lesson.check;

    elements.learningProgress.replaceChildren();
    lessons.forEach((item, lessonIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = lessonIndex === state.learningLesson ? "is-active" : lessonIndex < state.learningLesson ? "is-complete" : "";
      button.setAttribute("aria-label", `Ir a la lección ${lessonIndex + 1}: ${item.title}`);
      button.addEventListener("click", () => renderLesson(lessonIndex));
      elements.learningProgress.append(button);
    });
    elements.previousLessonButton.disabled = state.learningLesson === 0;
    elements.nextLessonButton.textContent = state.learningLesson === lessons.length - 1 ? "Volver y resolver →" : "Siguiente lección →";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openLearningMode() {
    closeInlineMeasureEditor();
    document.body.classList.add("learning-mode");
    elements.learningPanel.hidden = false;
    renderLesson(0);
  }

  function closeLearningMode() {
    document.body.classList.remove("learning-mode");
    elements.learningPanel.hidden = true;
    state.mobileScreen = 1;
    syncMobileMode();
    setMobileScreen(1);
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

  function isMobileWizard() {
    return document.body.classList.contains("focused-wizard");
  }

  function updateMobileWizardControls() {
    if (!isMobileWizard()) return;
    const names = ["Cargar foto", "Revisar figura y datos", "Explicación paso a paso", "Resultado final"];
    elements.mobileStepCount.textContent = `Paso ${state.mobileScreen} de 4`;
    elements.mobileStepName.textContent = state.mobileScreen === 3 && state.steps.length
      ? `${state.currentStep + 1}/${state.steps.length} · ${state.steps[state.currentStep].title}`
      : names[state.mobileScreen - 1];
    elements.mobileBackButton.disabled = state.mobileScreen === 1;
    if (state.mobileScreen === 1) elements.mobileNextButton.textContent = "Comparar →";
    if (state.mobileScreen === 2) elements.mobileNextButton.textContent = "Resolver →";
    if (state.mobileScreen === 3) elements.mobileNextButton.textContent = state.steps.length && state.currentStep >= state.steps.length - 1 ? "Ver resultado →" : "Siguiente cuenta →";
    if (state.mobileScreen === 4) elements.mobileNextButton.textContent = "Editar datos";
  }

  function setMobileScreen(screen, scrollToTop = true) {
    if (!isMobileWizard()) return;
    state.mobileScreen = Math.max(1, Math.min(4, screen));
    if (state.mobileScreen !== 2) closeInlineMeasureEditor();
    document.body.dataset.mobileStep = String(state.mobileScreen);
    updateProgress(state.mobileScreen);
    updateMobileWizardControls();
    if (scrollToTop) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncMobileMode() {
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    document.body.classList.add("focused-wizard");
    document.body.classList.toggle("mobile-wizard", mobile);
    elements.mobileWizardNav.hidden = false;
    setMobileScreen(state.mobileScreen, false);
  }

  function setFormError(message, type = "error") {
    elements.formMessage.textContent = message;
    elements.formMessage.hidden = !message;
    elements.formMessage.classList.toggle("is-incomplete", Boolean(message) && type === "incomplete");
  }

  function clearCalculatedOutput(subtitle) {
    elements.perimeterResult.textContent = "—";
    elements.areaResult.textContent = "—";
    elements.angleResults.innerHTML = "<span>∠A = —</span><span>∠B = —</span><span>∠D = —</span><span>∠E = —</span><span>∠F = —</span><span>Suma = —</span>";
    elements.measurementGrid.innerHTML = "";
    elements.consistencyWarning.hidden = true;
    elements.resultSubtitle.textContent = subtitle;
    elements.printButton.disabled = true;
  }

  function blockSolution(message) {
    state.result = null;
    state.steps = [];
    state.currentStep = 0;
    setFormError(message);
    clearCalculatedOutput("No mostramos resultados porque los datos no forman una figura válida.");
    elements.stepBadge.textContent = "Revisá los datos";
    elements.stepTitle.textContent = "No podemos empezar todavía";
    renderKnownChips([{ text: "Hay datos incompatibles", tone: "red" }]);
    elements.stepDescription.textContent = message;
    elements.stepRule.textContent = "Primero corregí el dato señalado. Después GeoPaso volverá a comprobar toda la figura.";
    elements.stepFormula.textContent = "No realizamos cuentas con datos matemáticamente imposibles.";
    elements.stepResult.textContent = "No hay un resultado válido hasta corregir los datos.";
    elements.stepDots.replaceChildren();
    elements.previousStep.disabled = true;
    elements.nextStep.disabled = true;
    state.points = schematicPoints();
    renderFigure();
    updateProgress(2);
    showToast("No se puede resolver: revisá el mensaje rojo.");
  }

  function showIncomplete(message) {
    state.result = null;
    state.steps = [];
    state.currentStep = 0;
    setFormError(message, "incomplete");
    clearCalculatedOutput("Todavía faltan datos; no significa que el ejercicio esté mal.");
    elements.stepBadge.textContent = "Faltan datos";
    elements.stepTitle.textContent = "La figura todavía no está determinada";
    renderKnownChips([{ text: "Información insuficiente", tone: "orange" }]);
    elements.stepDescription.textContent = message;
    elements.stepRule.textContent = "Agregá uno de los datos sugeridos. GeoPaso recién comprobará las reglas cuando haya información suficiente.";
    elements.stepFormula.textContent = "Faltan datos ≠ datos incorrectos";
    elements.stepResult.textContent = "Todavía puede existir una figura válida, pero no hay una única respuesta.";
    elements.stepDots.replaceChildren();
    elements.previousStep.disabled = true;
    elements.nextStep.disabled = true;
    state.points = schematicPoints();
    renderFigure();
    updateProgress(2);
    showToast("Faltan datos para obtener una respuesta única.");
  }

  function solve(event) {
    event?.preventDefault();
    const rawData = readInputs();
    const completion = completeGeometryData(rawData);
    if (completion.issue) {
      if (completion.issue.type === "incomplete") showIncomplete(completion.issue.message);
      else blockSolution(completion.issue.message);
      return;
    }

    try {
      const data = completion.data;
      const result = solveGeometry(data);
      const geometryError = validateSolvedGeometry(result);
      if (geometryError) {
        blockSolution(geometryError);
        return;
      }
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
      if (isMobileWizard()) setMobileScreen(3);
      else $("#explanationPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      blockSolution(error.message || "No pudimos resolver la figura con estos datos. Revisá las medidas ingresadas.");
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
    if (!showDiagram) closeInlineMeasureEditor();
    elements.diagramStage.hidden = !showDiagram;
    elements.photoStage.hidden = showDiagram;
    elements.diagramTab.classList.toggle("is-active", showDiagram);
    elements.photoTab.classList.toggle("is-active", !showDiagram);
    elements.diagramTab.setAttribute("aria-selected", String(showDiagram));
    elements.photoTab.setAttribute("aria-selected", String(!showDiagram));
  }

  function resetExample() {
    Object.entries(defaults).forEach(([key, value]) => {
      elements.inputs[key].value = value === null ? "" : String(value).replace(".", ",");
    });
    state.result = null;
    state.steps = [];
    state.currentStep = 0;
    state.points = schematicPoints();
    state.toScale = false;
    state.drawMode = false;
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    state.activePointers.clear();
    state.pinchActive = false;
    closeInlineMeasureEditor();
    elements.scaleButton.setAttribute("aria-pressed", "false");
    elements.dragHelper.hidden = true;
    elements.figureModeLabel.textContent = "Esquema claro del ejercicio";
    applyFigureTransform();
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
      AC: /\bAC\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      CB: /\bCB\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      DC: /\bDC\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      DB: /\bDB\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      AD: /\bAD\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      DE: /\bDE\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      EB: /\bEB\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      BF: /\bBF\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
      EF: /\b(?:EF|FE)\s*(?:=|mide|:)\s*(\d+(?:\.\d+)?)/i,
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
      } else {
        elements.inputs[key].value = "";
      }
    });
    state.result = null;
    state.steps = [];
    state.points = schematicPoints();
    renderFigure();
    setFormError("");
    clearCalculatedOutput(found ? "Completá los datos marcados con “?” y después resolvé." : "No detectamos datos suficientes. Completalos manualmente.");
    elements.stepBadge.textContent = "Datos detectados";
    elements.stepTitle.textContent = found ? "Revisá lo que encontramos" : "Completá los datos a mano";
    renderKnownChips([{ text: found ? `${found} dato${found === 1 ? "" : "s"} encontrado${found === 1 ? "" : "s"}` : "Faltan datos", tone: found ? "green" : "orange" }]);
    elements.stepDescription.textContent = "Las casillas y etiquetas con “?” no fueron detectadas. Tocá cada una para escribir su valor.";
    elements.stepRule.textContent = "GeoPaso no comenzará las cuentas hasta que estén todos los datos necesarios.";
    elements.stepFormula.textContent = "Dato detectado = número visible. Dato faltante = ?";
    elements.stepResult.textContent = "Revisá los datos antes de resolver.";
    elements.stepDots.replaceChildren();
    elements.previousStep.disabled = true;
    elements.nextStep.disabled = true;
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
    closeInlineMeasureEditor();
    state.drawMode = !state.drawMode;
    elements.dragHelper.hidden = !state.drawMode;
    elements.figureModeLabel.textContent = state.drawMode ? "Ajustá los puntos arrastrándolos" : (state.toScale ? "Vista proporcional a las medidas" : "Esquema claro del ejercicio");
    renderFigure();
    showToast(state.drawMode ? "Modo ajuste activado." : "Modo ajuste desactivado.");
  }

  function bindSelectableElements() {
    elements.svg.addEventListener("click", event => {
      if (state.suppressNextClick) {
        event.preventDefault();
        return;
      }
      const editableMeasure = event.target.closest("[data-input-key]");
      if (editableMeasure && !state.drawMode) {
        openInlineMeasureEditor(editableMeasure.dataset.inputKey, event.clientX, event.clientY, editableMeasure);
        return;
      }
      closeInlineMeasureEditor();
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
        openInlineMeasureEditor(editableMeasure.dataset.inputKey, null, null, editableMeasure);
      }
    });
  }

  function measureResultValue(key) {
    if (!state.result) return null;
    if (key === "angleA") return state.result.angles.angleA;
    if (key === "angleB") return state.result.data.angleB;
    if (key === "angleF") return state.result.data.angleF;
    if (["AB", "DC", "DE"].includes(key)) return state.result.data[key];
    return state.result.lengths[key] ?? null;
  }

  function openInlineMeasureEditor(key, clientX, clientY, target) {
    const sourceInput = elements.inputs[key];
    if (!sourceInput) return;
    const labels = { angleA: "Ángulo A", angleB: "Ángulo B₁", angleF: "Ángulo F" };
    const stageRect = elements.diagramStage.getBoundingClientRect();
    const targetRect = target?.getBoundingClientRect();
    const x = clientX ?? (targetRect ? targetRect.left + targetRect.width / 2 : stageRect.left + stageRect.width / 2);
    const y = clientY ?? (targetRect ? targetRect.top + targetRect.height / 2 : stageRect.top + stageRect.height / 2);
    const editorHalfWidth = Math.min(115, Math.max(70, stageRect.width / 2 - 8));
    const relativeX = Math.max(editorHalfWidth, Math.min(stageRect.width - editorHalfWidth, x - stageRect.left));
    const relativeY = Math.max(12, Math.min(stageRect.height - 12, y - stageRect.top));
    const opensDown = relativeY < 118;

    state.inlineEditKey = key;
    elements.inlineMeasureLabel.textContent = `Editar ${labels[key] || key}`;
    elements.inlineMeasureUnit.textContent = key.startsWith("angle") ? "°" : "cm";
    const fallbackValue = measureResultValue(key);
    elements.inlineMeasureInput.value = sourceInput.value.trim() || (Number.isFinite(fallbackValue) ? formatNumber(fallbackValue) : "");
    elements.inlineMeasureInput.placeholder = "?";
    elements.inlineMeasureEditor.style.left = `${relativeX}px`;
    elements.inlineMeasureEditor.style.top = `${relativeY}px`;
    elements.inlineMeasureEditor.classList.toggle("opens-down", opensDown);
    elements.inlineMeasureEditor.hidden = false;
    elements.inlineMeasureInput.focus({ preventScroll: true });
    elements.inlineMeasureInput.select();
    elements.figureTip.textContent = `Editando ${labels[key] || key} directamente sobre el dibujo.`;
  }

  function closeInlineMeasureEditor() {
    state.inlineEditKey = null;
    elements.inlineMeasureEditor.hidden = true;
  }

  function saveInlineMeasure() {
    const key = state.inlineEditKey;
    const sourceInput = key ? elements.inputs[key] : null;
    if (!sourceInput) return;
    sourceInput.value = elements.inlineMeasureInput.value.trim();
    sourceInput.dispatchEvent(new Event("input", { bubbles: true }));
    closeInlineMeasureEditor();
    showToast(sourceInput.value.trim() ? `${key} actualizado. Tocá “Resolver” para comprobarlo.` : `${key} quedó sin dato.`);
  }

  function focusEditableInput(key) {
    const input = elements.inputs[key];
    if (!input) return;
    if (["AC", "CB", "DB", "AD", "EB", "BF", "EF"].includes(key)) {
      $("#extraDataDetails").open = true;
    }
    if (isMobileWizard()) setMobileScreen(2, false);
    $("#dataPanel").scrollIntoView({ behavior: "smooth", block: "center" });
    $$(".data-row").forEach(row => row.classList.toggle("is-editing", row.contains(input)));
    input.focus({ preventScroll: true });
    input.select();
    elements.figureTip.textContent = `Editando ${key}. Escribí la medida correcta y tocá “Recalcular paso a paso”.`;
  }

  function clampPan() {
    const rect = elements.svg.getBoundingClientRect();
    // Dejamos un recorrido amplio incluso con poco zoom. Si la figura se aleja,
    // el botón “Centrar” siempre permite recuperarla en un toque.
    const maxX = rect.width * 1.35;
    const maxY = rect.height * 1.2;
    state.panX = Math.max(-maxX, Math.min(maxX, state.panX));
    state.panY = Math.max(-maxY, Math.min(maxY, state.panY));
  }

  function applyFigureTransform() {
    clampPan();
    elements.zoomLayer.style.transformOrigin = "center";
    elements.zoomLayer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    elements.diagramStage.classList.add("can-pan");
  }

  function pointerMidpoint(first, second) {
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  }

  function bindEvents() {
    elements.learnModeButton.addEventListener("click", openLearningMode);
    elements.exitLearningButton.addEventListener("click", closeLearningMode);
    elements.previousLessonButton.addEventListener("click", () => renderLesson(state.learningLesson - 1));
    elements.nextLessonButton.addEventListener("click", () => {
      if (state.learningLesson >= lessons.length - 1) closeLearningMode();
      else renderLesson(state.learningLesson + 1);
    });

    elements.svg.addEventListener("pointerdown", event => {
      if (event.pointerType !== "touch") return;
      state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      try { elements.svg.setPointerCapture(event.pointerId); } catch (_) { /* no-op */ }
      if (state.activePointers.size === 1 && !state.drawMode) {
        state.singlePan = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          panX: state.panX,
          panY: state.panY
        };
        state.panActive = false;
      }
      if (state.activePointers.size === 2) {
        const [first, second] = [...state.activePointers.values()];
        state.pinchStartDistance = Math.hypot(second.x - first.x, second.y - first.y);
        state.pinchStartZoom = state.zoom;
        state.pinchStartMidpoint = pointerMidpoint(first, second);
        state.pinchStartPanX = state.panX;
        state.pinchStartPanY = state.panY;
        state.pinchActive = true;
        state.singlePan = null;
        state.draggedPoint = null;
        closeInlineMeasureEditor();
        elements.diagramStage.classList.add("is-pinching");
      }
    });

    elements.svg.addEventListener("pointermove", event => {
      if (state.activePointers.has(event.pointerId)) {
        state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }
      if (state.pinchActive && state.activePointers.size >= 2) {
        const [first, second] = [...state.activePointers.values()];
        const distance = Math.hypot(second.x - first.x, second.y - first.y);
        if (state.pinchStartDistance > 0) {
          state.zoom = Math.max(.65, Math.min(2.5, state.pinchStartZoom * distance / state.pinchStartDistance));
          const midpoint = pointerMidpoint(first, second);
          state.panX = state.pinchStartPanX + midpoint.x - state.pinchStartMidpoint.x;
          state.panY = state.pinchStartPanY + midpoint.y - state.pinchStartMidpoint.y;
          applyFigureTransform();
          elements.figureModeLabel.textContent = `Zoom ${Math.round(state.zoom * 100)}% · mové la figura con los dedos`;
          elements.figureTip.textContent = "Podés ampliar y desplazar al mismo tiempo con dos dedos.";
        }
        event.preventDefault();
        return;
      }
      if (state.singlePan && state.singlePan.pointerId === event.pointerId && !state.drawMode) {
        const dx = event.clientX - state.singlePan.startX;
        const dy = event.clientY - state.singlePan.startY;
        if (!state.panActive && Math.hypot(dx, dy) > 6) {
          state.panActive = true;
          state.suppressNextClick = true;
          closeInlineMeasureEditor();
          elements.diagramStage.classList.add("is-panning");
        }
        if (state.panActive) {
          state.panX = state.singlePan.panX + dx;
          state.panY = state.singlePan.panY + dy;
          applyFigureTransform();
          elements.figureTip.textContent = "Figura desplazada. Seguí arrastrando para recorrerla o tocá ⌗ para centrar.";
          event.preventDefault();
          return;
        }
      }
      if (!state.drawMode || !state.draggedPoint) return;
      const point = clientToSvg(event.clientX, event.clientY);
      state.points[state.draggedPoint] = {
        x: Math.max(35, Math.min(725, point.x)),
        y: Math.max(35, Math.min(490, point.y))
      };
      renderFigure();
    });
    elements.svg.addEventListener("pointerup", event => {
      state.activePointers.delete(event.pointerId);
      if (state.pinchActive && state.activePointers.size < 2) {
        state.pinchActive = false;
        state.pinchStartDistance = 0;
        state.pinchStartMidpoint = null;
        state.suppressNextClick = true;
        elements.diagramStage.classList.remove("is-pinching");
        setTimeout(() => { state.suppressNextClick = false; }, 350);
      }
      if (state.singlePan?.pointerId === event.pointerId || state.panActive) {
        state.singlePan = null;
        state.panActive = false;
        elements.diagramStage.classList.remove("is-panning");
        setTimeout(() => { state.suppressNextClick = false; }, 350);
      }
      state.draggedPoint = null;
      try { elements.svg.releasePointerCapture(event.pointerId); } catch (_) { /* no-op */ }
    });
    elements.svg.addEventListener("pointercancel", event => {
      state.activePointers.delete(event.pointerId);
      state.draggedPoint = null;
      state.singlePan = null;
      state.panActive = false;
      elements.diagramStage.classList.remove("is-panning");
      if (state.activePointers.size < 2) {
        state.pinchActive = false;
        state.pinchStartMidpoint = null;
        elements.diagramStage.classList.remove("is-pinching");
      }
    });

    elements.form.addEventListener("submit", solve);
    elements.inlineMeasureSave.addEventListener("click", saveInlineMeasure);
    elements.inlineMeasureCancel.addEventListener("click", closeInlineMeasureEditor);
    elements.inlineMeasureInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveInlineMeasure();
      } else if (event.key === "Escape") {
        closeInlineMeasureEditor();
      }
    });
    Object.values(elements.inputs).forEach(input => {
      input.addEventListener("focus", () => {
        $$(".data-row").forEach(row => row.classList.toggle("is-editing", row.contains(input)));
      });
      input.addEventListener("input", () => {
        state.result = null;
        state.steps = [];
        state.points = state.toScale ? scaledPoints(null) : schematicPoints();
        renderFigure();
        setFormError("");
        clearCalculatedOutput("Cambiaste un dato. Recalculá para actualizar los resultados.");
        elements.stepBadge.textContent = "Datos modificados";
        elements.stepTitle.textContent = "Volvé a comprobar la figura";
        renderKnownChips([{ text: "Datos todavía sin comprobar", tone: "orange" }]);
        elements.stepDescription.textContent = "Cambiaste una medida. Los pasos anteriores dejaron de ser válidos.";
        elements.stepRule.textContent = "Tocá “Recalcular paso a paso” para revisar primero si la figura es matemáticamente posible.";
        elements.stepFormula.textContent = "No mostramos cuentas antiguas después de cambiar un dato.";
        elements.stepResult.textContent = "Todavía no hay un resultado válido.";
        elements.stepDots.replaceChildren();
        elements.previousStep.disabled = true;
        elements.nextStep.disabled = true;
        elements.solveButton.innerHTML = '<span aria-hidden="true">↻</span> Recalcular paso a paso';
        updateProgress(2);
      });
    });

    $("#usePhotoButton").addEventListener("click", () => elements.photoInput.click());
    elements.photoInput.addEventListener("change", event => handleFile(event.target.files[0]));
    $("#drawButton").addEventListener("click", toggleDrawMode);
    elements.mobileAdjustButton.addEventListener("click", toggleDrawMode);
    $("#exampleButton").addEventListener("click", resetExample);
    $("#detectDataButton").addEventListener("click", detectPromptData);

    elements.diagramTab.addEventListener("click", () => switchFigureTab("diagram"));
    elements.photoTab.addEventListener("click", () => switchFigureTab("photo"));

    $("#zoomInButton").addEventListener("click", () => {
      state.zoom = Math.min(2.5, state.zoom + .15);
      applyFigureTransform();
      elements.figureModeLabel.textContent = `Zoom ${Math.round(state.zoom * 100)}% · arrastrá para recorrer`;
    });
    $("#zoomOutButton").addEventListener("click", () => {
      state.zoom = Math.max(.65, state.zoom - .15);
      applyFigureTransform();
      elements.figureModeLabel.textContent = `Zoom ${Math.round(state.zoom * 100)}%`;
    });
    $("#fitButton").addEventListener("click", () => {
      state.zoom = 1;
      state.panX = 0;
      state.panY = 0;
      applyFigureTransform();
      state.points = state.toScale ? scaledPoints(state.result) : schematicPoints();
      renderFigure();
      elements.figureModeLabel.textContent = state.toScale ? "Vista proporcional a las medidas" : "Esquema claro del ejercicio";
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
      if (isMobileWizard()) setMobileScreen(2);
      $("#dataPanel").scrollIntoView({ behavior: "smooth", block: "center" });
      elements.inputs.AB.focus({ preventScroll: true });
      elements.inputs.AB.select();
      showToast("Editá las casillas y después tocá “Recalcular paso a paso”.");
    });

    $$(".progress-step").forEach(step => {
      step.addEventListener("click", () => {
        const number = Number(step.dataset.progress);
        if (isMobileWizard()) {
          if (number >= 3 && !state.result) {
            setMobileScreen(2);
            showToast("Primero revisá los datos y tocá “Resolver”.");
          } else {
            setMobileScreen(number);
          }
          return;
        }
        const target = number === 1 ? $("#figurePanel") : number === 2 ? $("#dataPanel") : number === 3 ? $("#explanationPanel") : $("#resultsPanel");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    elements.mobileBackButton.addEventListener("click", () => {
      if (state.mobileScreen === 3 && state.currentStep > 0) {
        renderStep(state.currentStep - 1);
      } else if (state.mobileScreen > 1) {
        setMobileScreen(state.mobileScreen - 1);
      }
    });

    elements.mobileNextButton.addEventListener("click", () => {
      if (state.mobileScreen === 1) {
        setMobileScreen(2);
      } else if (state.mobileScreen === 2) {
        elements.form.requestSubmit();
      } else if (state.mobileScreen === 3) {
        if (!state.result || !state.steps.length) {
          setMobileScreen(2);
          showToast("Primero resolvé la figura.");
        } else if (state.currentStep < state.steps.length - 1) {
          renderStep(state.currentStep + 1);
        } else {
          setMobileScreen(4);
        }
      } else {
        setMobileScreen(2);
      }
    });

    window.matchMedia("(max-width: 720px)").addEventListener("change", syncMobileMode);

    bindSelectableElements();
  }

  state.points = schematicPoints();
  bindEvents();
  syncMobileMode();
  renderFigure();
})();
