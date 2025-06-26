document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("notice-popup").style.display = "flex";
  document.getElementById("notice-close").onclick = function() {
    document.getElementById("notice-popup").style.display = "none";
  };

  // === БЛОК: Получение элементов управления ===
  const baseColorSelect = document.getElementById("baseColorSelect");
  const designSelect = document.getElementById("designSelect");
  const layers = document.getElementById("layers");
  const stitchColorSelect = document.getElementById("stitchColorSelect");
  const embroiderySelect = document.getElementById("embroiderySelect");
  const embroideryEnable = document.getElementById("embroideryEnable");
  const stripeOption = document.getElementById("stripeOption");
  const stripeColorSelect = document.getElementById("stripeColorSelect");
  const logoSelect = document.getElementById("logoSelect");
  const logoEnable = document.getElementById("logoEnable");
  const centerSelect = document.getElementById("centerSelect");
  const centerLaminCheckbox = document.getElementById("centerLaminCheckbox");
  const centerLaminColorSelect = document.getElementById("centerLaminColorSelect");
  const centerPerfaCheckbox = document.getElementById("centerPerfaCheckbox");
  const centerPerfaColorSelect = document.getElementById("centerPerfaColorSelect");
  const insertEnable = document.getElementById("insertEnable");
  const insertColorSelect = document.getElementById("insertColorSelect");
  const centerDecorSelect = document.getElementById("centerDecorSelect");
  const innerInsertCheckbox = document.getElementById("innerInsertCheckbox");
  const headrestSelect = document.getElementById("headrestSelect");

  // === БЛОК: Порядок слоёв для отображения ===
  const layerOrder = [
    "centerLamin",
    "centerPerfa",
    "center",
    "base",
    "headrest",
    "insert",
    "insertInner",
    "stitching",
    "embroidery",
    "centerDecor",
    "stripe",
    "logo"
    
  ];

  // === БЛОК: Очистка слоя по имени ===
  function clearLayer(name, container = layers) {
    const existing = container.querySelector?.(`[data-layer="${name}"]`);
    if (existing) existing.remove();
  }

  // === БЛОК: Очистка всех слоёв ===
  function clearAllLayers() {
    while (layers.firstChild) {
      layers.removeChild(layers.firstChild);
    }
  }

  // === БЛОК: Цвета шва (используются для шва и полосы) ===
  const stitchColors = {
    "черная": "#000000",
    "бежевая": "#9da600",
    "белая": "#fafafa",
    "бирюзовая": "#5e1717",
    "бордовая": "#800101",
    "бронзовая": "#ff4800",
    "зеленая": "#006400",
    "коричневая": "#291107",
    "красная": "#fa0202",
    "оранжевая": "#eb5905",
    "розовая": "#f5029c",
    "рыжая": "#ff6600",
    "светло-серая": "#d3d3d3",
    "серая": "#262626",
    "синяя": "#0000ff",
    "фиолетовая": "#800080"
  };

  // === БЛОК: Цвета основы ===
  const baseColors = {
    "кожзам чорний": "#000000",
    "кожзам бордо": "#960606",
    "кожзам зелений": "#1a7d1e",
    "кожзам коричневий": "#663009",
    "кожзам світло-коричневий": "#b85711",
    "кожзам червоний": "#ff0000",
    "кожзам рудий": "#ff7700",
    "кожзам слонова кістка": "#c7ba61",
    "кожзам світлий беж": "#ffc95e",
    "кожзам світло-сірий": "#cccccc",
    "кожзам сірий": "#5e5d5d",
    "кожзам синій": "#23276e",
    "кожзам хакі": "#0e3804"
  };

  // === БЛОК: id слоёв основы для перекраски ===
  const baseLayerIds = [
    "path4217",
    "path7247",
    "path7247",
    "path8759"
    // Добавь сюда все id, которые нужно перекрашивать в base/*.svg
  ];

  // === БЛОК: id внутренних вставок для каждого дизайна ===
  const baseInsertIds = {
    "комфорт1": ["path7228", "insertPath3", "insertPath4"],
    "комфортплюс2": ["insertPath5", "insertPath6", "insertPath7", "insertPath8"],
    "комфортплюс3": ["insertPath9", "insertPath10", "insertPath11", "insertPath12"],
    "спорт3": ["insertPath13", "insertPath14", "insertPath15", "insertPath16"]
    // Заполни реальными id для каждого дизайна!
  };

  // === БЛОК: Универсальная перекраска SVG по id ===
  function recolorSvgByIds(svg, ids, color) {
    ids.forEach(id => {
      const el = svg.getElementById(id);
      if (el) el.setAttribute("fill", color);
    });
  }

  // === БЛОК: Формирование списка цветов основы ===
  function fillColorSelect(select, colors) {
    select.innerHTML = "";
    Object.keys(colors).forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }

  // Заполняем селекты
  fillColorSelect(baseColorSelect, baseColors);
  fillColorSelect(centerLaminColorSelect, baseColors);
  fillColorSelect(centerPerfaColorSelect, baseColors);
  fillColorSelect(insertColorSelect, baseColors);
  fillColorSelect(stripeColorSelect, baseColors);

  // === БЛОК: Автозагрузка при старте ===
  fillCenterSelect().then(() => renderLayers());
  fillEmbroiderySelect().then(() => {
    embroiderySelect.addEventListener("change", renderLayers);
    if (!embroideryEnable.checked) {
      embroiderySelect.selectedIndex = -1;
      clearLayer("embroidery");
    }
    renderLayers();
  });
  fillLogoSelect().then(() => {
    logoSelect.disabled = !logoEnable.checked;
    renderLayers();
  });

  updateCenterControls();
  updateStripeControls();

  // === БЛОК: Отрисовка всех слоёв ===
  async function renderLayers() {
    const tempLayers = document.createDocumentFragment();

    const design = designSelect.value.toLowerCase().replace(/ /g, "");
    const baseColor = baseColors[baseColorSelect.value] || "#bdbdbd";
    const stitchColor = stitchColors[stitchColorSelect.value] || "#000000";
    const laminColor = centerLaminColorSelect.value;
    const perfaColor = centerPerfaColorSelect.value;

    for (const layer of layerOrder) {
      switch(layer) {
        case "base":
          await updateBaseImage(design, "base.svg", baseColor, tempLayers);
          break;
        case "insertInner":
          await updateInsertInner(baseColor, innerInsertCheckbox.checked, tempLayers);
          break;
        case "centerLamin":
          if (centerLaminCheckbox.checked) {
            await updateCenterLamin(design, laminColor, tempLayers);
          }
          break;
        case "centerPerfa":
          if (!centerLaminCheckbox.checked && centerPerfaCheckbox.checked) {
            await updateCenterPerfa(design, perfaColor, tempLayers);
          }
          break;
        case "center":
          if (!centerLaminCheckbox.checked && !centerPerfaCheckbox.checked) {
            await updateCenter(centerSelect.value, tempLayers);
          }
          break;
        case "stitching":
          await updateStitching(stitchColor, tempLayers);
          break;
        case "embroidery":
          if (embroideryEnable.checked && !stripeOption.checked) {
            await updateEmbroidery(tempLayers);
          }
          break;
        case "centerDecor":
          if (!embroideryEnable.checked && !stripeOption.checked) {
            await updateCenterDecor(stitchColorSelect.value, centerDecorSelect.value, tempLayers);
          }
          break;
        case "stripe":
          await updateStripe(tempLayers);
          break;
        case "logo":
          await updateLogo(tempLayers);
          break;
        case "insert":
          if (insertEnable.checked) {
            await updateInsert(design, insertColorSelect.value, tempLayers);
          }
          break;
        case "headrest":
          await updateHeadrest(design, headrestSelect.value, centerSelect.value, tempLayers);
          break;
      }
    }

    layers.innerHTML = "";
    layers.appendChild(tempLayers);
  }

  // === БЛОК: Перекраска основы (base) ===
  async function updateBaseImage(design, fileName, color = "#bdbdbd", container = layers) {
    clearLayer("base", container);
    if (fileName.endsWith(".svg")) {
      const response = await fetch(`images/base/${design}/${fileName}`);
      let svgText = await response.text();
      const div = document.createElement("div");
      div.innerHTML = svgText;
      const svg = div.firstElementChild;
      svg.setAttribute("data-layer", "base");
      svg.style.position = "absolute";
      svg.style.top = 0;
      svg.style.left = 0;
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      svg.style.objectFit = "contain";
      baseLayerIds.forEach(id => {
        const part = svg.getElementById(id);
        if (part) {
          part.setAttribute("fill", color);
          part.style.fill = color;
          part.setAttribute("fill-opacity", "1");
          part.style.fillOpacity = "1";
        }
      });
      container.appendChild(svg);
    } else {
      const img = document.createElement("img");
      img.src = `images/base/${design}/${fileName}`;
      img.setAttribute("data-layer", "base");
      container.appendChild(img);
    }
  }

  // === БЛОК: Новый слой внутренних вставок ===
  async function updateInsertInner(baseColor, isNone, container = layers) {
    clearLayer("insertInner", container);
    if (isNone) return;
    const file = "insert-insert.svg";
    const response = await fetch(`images/inner-inserts/${file}`);
    if (!response.ok) return;
    let svgText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "insertInner");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    svg.querySelectorAll('path, rect').forEach(el => {
      el.setAttribute("fill", baseColor);
      el.style.fill = baseColor;
      el.setAttribute("fill-opacity", "1");
      el.style.fillOpacity = "1";
    });
    container.appendChild(svg);
  }

  // === БЛОК: Перекраска шва (stitching) ===
  async function updateStitching(color, container = layers) {
    clearLayer("stitching", container);
    const design = designSelect.value.toLowerCase().replace(/ /g, "");
    const response = await fetch(`images/stitching/${design}/stitching.svg`);
    if (!response.ok) return;
    let svgText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "stitching");
    svg.style.position = "absolute";
    svg.style.top = 0;
    svg.style.left = 0;
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    svg.style.filter = "brightness(90) contrast(90)";
    const stitchingIds = [ "path1340", "path302", "path7434" ];
    stitchingIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("stroke", color);
        part.style.stroke = color;
        part.setAttribute('stroke-width', '11');
      }
    });
    container.appendChild(svg);
  }

  // === БЛОК: Перекраска вышивки (embroidery) ===
  async function updateEmbroidery(container = layers) {
    clearLayer("embroidery", container);
    if (embroiderySelect.value === "none.svg") return;
    const file = embroiderySelect.value;
    const color = stitchColors[stitchColorSelect.value] || "#000000";
    if (!file) return;
    const response = await fetch(`images/embroidery/${file}`);
    let svgText = await response.text();
    svgText = svgText
      .replace(/stroke=['"]#[0-9a-fA-F]{3,6}['"]/g, `stroke="${color}"`)
      .replace(/stroke:\s*#[0-9a-fA-F]{3,6}/g, `stroke:${color}`)
      .replace(/fill=['"]#[0-9a-fA-F]{3,6}['"]/g, `fill="${color}"`)
      .replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill:${color}`);
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "embroidery");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    svg.style.filter = "brightness(90) contrast(90)";
    svg.querySelectorAll('[stroke]').forEach(el => {
      el.setAttribute('stroke-width', '13');
    });
    container.appendChild(svg);
  }

  // === БЛОК: Перекраска центра (декор) ===
  async function updateCenterDecor(colorName, fileName, container = layers) {
    clearLayer("centerDecor", container);
    if (!fileName || fileName === "Без отделки по центру.svg") return;
    const color = stitchColors[colorName] || "#000000";
    const response = await fetch(`images/embroidery_standart/${fileName}`);
    if (!response.ok) return;
    let svgText = await response.text();
    svgText = svgText
      .replace(/stroke=['"]#[0-9a-fA-F]{3,6}['"]/g, `stroke="${color}"`)
      .replace(/stroke:\s*#[0-9a-fA-F]{3,6}/g, `stroke:${color}`)
      .replace(/fill=['"]#[0-9a-fA-F]{3,6}['"]/g, `fill="${color}"`)
      .replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill:${color}`);
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "centerDecor");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    svg.style.filter = "brightness(90) contrast(90)";
    svg.querySelectorAll('[stroke]').forEach(el => {
      el.setAttribute('stroke-width', '13');
    });
    container.appendChild(svg);
  }

  // === БЛОК: Полоса по центру (stripe) ===
  async function updateStripe(container = layers) {
    clearLayer("stripe", container);
    if (!stripeOption.checked) return;
    const color = baseColors[stripeColorSelect.value] || "#ffd500";
    const response = await fetch('images/stripe/stripe.svg');
    if (!response.ok) return;
    let svgText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "stripe");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    svg.querySelectorAll('path').forEach(el => {
      el.setAttribute("fill", color);
      el.style.fill = color;
      el.setAttribute("fill-opacity", "1");
      el.style.fillOpacity = "1";
    });
    container.appendChild(svg);
  }

  // === БЛОК: Логотип (logo) ===
  async function updateLogo(container = layers) {
    clearLayer("logo", container);
    if (!logoEnable.checked) return;
    const file = logoSelect.value;
    if (!file) return;
    const response = await fetch(`images/logos/${file}`);
    let svgText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "logo");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    container.appendChild(svg);
  }

  // === БЛОК: Вставка (insert) ===
  async function updateInsert(design, colorName, container = layers) {
    clearLayer("insert", container);
    if (!insertEnable.checked) return;
    const color = baseColors[colorName] || "#bdbdbd";
    const fileName = `insert_${design}.svg`;
    const response = await fetch(`images/inserts/${design}/${fileName}`);
    if (!response.ok) return;
    let svgText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "insert");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    const insertIds = ["path15499", "path8801", "path12587"];
    insertIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("fill", color);
        part.style.fill = color;
        part.setAttribute("fill-opacity", "1");
        part.style.fillOpacity = "1";
      }
    });
    container.appendChild(svg);
  }

  // === БЛОК: Отображение выбранного центра ===
  async function updateCenter(file, container = layers) {
    clearLayer("center", container);
    if (!file) return;
    if (file.endsWith('.svg')) {
      const response = await fetch(`images/centers/${file}`);
      let svgText = await response.text();
      const div = document.createElement("div");
      div.innerHTML = svgText;
      const svg = div.firstElementChild;
      svg.setAttribute("data-layer", "center");
      svg.style.position = "absolute";
      svg.style.left = 0;
      svg.style.top = 0;
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      svg.style.objectFit = "contain";
      container.appendChild(svg);
    } else {
      const img = document.createElement("img");
      img.src = `images/centers/${file}`;
      img.setAttribute("data-layer", "center");
      img.style.position = "absolute";
      img.style.left = 0;
      img.style.top = 0;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      container.appendChild(img);
    }
  }

  // === БЛОК: Функции отрисовки новых центров центр кожзам ===
  async function updateCenterLamin(design, colorName, container = layers) {
    clearLayer("centerLamin", container);
    if (!centerLaminCheckbox.checked) return;
    const color = baseColors[colorName] || "#bdbdbd";
    const response = await fetch(`images/centers_lamin/${design}/center.svg`);
    let svgText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "centerLamin");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    const centerLaminIds = ["path1830", "path15616", "path302"];
    centerLaminIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("fill", color);
        part.style.fill = color;
        part.setAttribute("fill-opacity", "1");
        part.style.fillOpacity = "1";
      }
    });
    container.appendChild(svg);
  }

  async function updateCenterPerfa(design, colorName, container = layers) {
    clearLayer("centerPerfa", container);
    if (!centerPerfaCheckbox.checked) return;
    const color = baseColors[colorName] || "#bdbdbd";
    const response = await fetch(`images/centers_perfa/${design}/center.svg`);
    let svgText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = svgText;
    const svg = div.firstElementChild;
    svg.setAttribute("data-layer", "centerPerfa");
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.objectFit = "contain";
    const centerPerfaIds = ["path428","path430","path432", "path3114"];
    centerPerfaIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("fill", color);
        part.style.fill = color;
        part.setAttribute("fill-opacity", "1");
        part.style.fillOpacity = "1";
      }
    });
    container.appendChild(svg);
  }

  // === БЛОК: Для будущих слоёв (например, цветные вставки) ===
  function updateInsertControls() {
    insertColorSelect.disabled = !insertEnable.checked;
  }
  insertEnable.addEventListener("change", () => {
    updateInsertControls();
    renderLayers();
  });
  updateInsertControls();

  // === БЛОК: Заполнение списка вышивки ===
  async function fillEmbroiderySelect() {
    const response = await fetch('images/embroidery/embroidery.json');
    const files = await response.json();
    embroiderySelect.innerHTML = "";
    files.forEach(file => {
      const name = file.replace('.svg', '').replace('.png', '');
      const option = document.createElement("option");
      option.value = file;
      option.textContent = name;
      embroiderySelect.appendChild(option);
    });
  }

  // === БЛОК: Заполнение списка логотипов ===
  async function fillLogoSelect() {
    const response = await fetch('images/logos/logos.json');
    const files = await response.json();
    logoSelect.innerHTML = "";
    files.forEach(file => {
      const name = file.replace('.svg', '').replace('.png', '');
      const option = document.createElement("option");
      option.value = file;
      option.textContent = name;
      logoSelect.appendChild(option);
    });
  }

  // === БЛОК: Заполнение списка центров ===
  async function fillCenterSelect() {
    const [otdelkaFiles, bezotdelkaFiles] = await Promise.all([
      fetch('images/centers/otdelka/list.json').then(r => r.json()),
      fetch('images/centers/bezotdelka/list.json').then(r => r.json())
    ]);
    centerSelect.innerHTML = "";
    otdelkaFiles.forEach(file => {
      const option = document.createElement("option");
      option.value = `otdelka/${file}`;
      option.textContent = file.replace(/\.\w+$/, "") + " (отделка)";
      option.dataset.type = "otdelka";
      centerSelect.appendChild(option);
    });
    bezotdelkaFiles.forEach(file => {
      const option = document.createElement("option");
      option.value = `bezotdelka/${file}`;
      option.textContent = file.replace(/\.\w+$/, "") + " (без отделки)";
      option.dataset.type = "bezotdelka";
      centerSelect.appendChild(option);
    });
  }

  // === БЛОК: Логика блокировки чекбоксов и select-ов ===
  function updateCenterControls() {
    if (centerLaminCheckbox.checked) {
      centerLaminColorSelect.disabled = false;
      centerPerfaCheckbox.disabled = true;
      centerPerfaCheckbox.checked = false;
      centerPerfaColorSelect.disabled = true;
      centerSelect.disabled = true;
    } else if (centerPerfaCheckbox.checked) {
      centerPerfaColorSelect.disabled = false;
      centerLaminCheckbox.disabled = true;
      centerLaminCheckbox.checked = false;
      centerLaminColorSelect.disabled = true;
      centerSelect.disabled = true;
    } else {
      centerLaminColorSelect.disabled = true;
      centerPerfaColorSelect.disabled = true;
      centerLaminCheckbox.disabled = false;
      centerPerfaCheckbox.disabled = false;
      centerSelect.disabled = false;
    }
  }

  function updateInnerInsertLock() {
    if (centerLaminCheckbox.checked || centerPerfaCheckbox.checked) {
      innerInsertCheckbox.disabled = true;
    } else {
      innerInsertCheckbox.disabled = false;
    }

    if (innerInsertCheckbox.checked) {
      centerLaminCheckbox.checked = false;
      centerLaminCheckbox.disabled = true;
      centerLaminColorSelect.disabled = true;

      centerPerfaCheckbox.checked = false;
      centerPerfaCheckbox.disabled = true;
      centerPerfaColorSelect.disabled = true;
    } else {
      centerLaminCheckbox.disabled = false;
      centerLaminColorSelect.disabled = !centerLaminCheckbox.checked;
      centerPerfaCheckbox.disabled = false;
      centerPerfaColorSelect.disabled = !centerPerfaCheckbox.checked;
    }
  }

  // === БЛОК: Подголовник ===
  async function updateHeadrest(design, headrestType, centerFile, container = layers) {
    clearLayer("headrest", container);

    if (headrestType === "center") {
      // Центр кожзам
      if (centerLaminCheckbox.checked) {
        const response = await fetch('images/headrests/Центр штучна екошкіра.svg');
        if (!response.ok) return;
        let svgText = await response.text();
        const div = document.createElement("div");
        div.innerHTML = svgText;
        const svg = div.firstElementChild;
        svg.setAttribute("data-layer", "headrest");
        svg.style.position = "absolute";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.objectFit = "contain";
        const color = baseColors[centerLaminColorSelect.value] || "#bdbdbd";
        const headrestLaminIds = ["path6052-5"];
        headrestLaminIds.forEach(id => {
          const part = svg.getElementById(id);
          if (part) {
            part.setAttribute("fill", color);
            part.style.fill = color;
            part.setAttribute("fill-opacity", "1");
            part.style.fillOpacity = "1";
          }
        });
        container.appendChild(svg);
        return;
      }

      // Центр перфорация
      if (centerPerfaCheckbox.checked) {
        const response = await fetch('images/headrests/Центр перфорація.svg');
        if (!response.ok) return;
        let svgText = await response.text();
        const div = document.createElement("div");
        div.innerHTML = svgText;
        const svg = div.firstElementChild;
        svg.setAttribute("data-layer", "headrest");
        svg.style.position = "absolute";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.objectFit = "contain";
        const color = baseColors[centerPerfaColorSelect.value] || "#bdbdbd";
        const headrestPerfaIds = ["path6052"];
        headrestPerfaIds.forEach(id => {
          const part = svg.getElementById(id);
          if (part) {
            part.setAttribute("fill", color);
            part.style.fill = color;
            part.setAttribute("fill-opacity", "1");
            part.style.fillOpacity = "1";
          }
        });
        container.appendChild(svg);
        return;
      }

      // Если не кожзам и не перфорация — обычная логика PNG по имени центра
      if (centerFile) {
        const fileName = centerFile.split('/').pop();
        const img = document.createElement("img");
        img.src = `images/headrests/${fileName}`;
        img.setAttribute("data-layer", "headrest");
        img.style.position = "absolute";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.pointerEvents = "none";
        img.style.objectFit = "contain";
        container.appendChild(img);
      }
    }
  }

  // === БЛОК: События (обработчики интерфейса) ===
  baseColorSelect.addEventListener("change", renderLayers);
  designSelect.addEventListener("change", () => {
    const design = designSelect.value.trim().toLowerCase();
    if (design === "спорт 3" || design === "спорт3") {
      logoEnable.checked = false;
      logoEnable.disabled = true;
      logoSelect.disabled = true;
    } else {
      logoEnable.disabled = false;
      logoSelect.disabled = !logoEnable.checked;
    }
    renderLayers();
  });
  stitchColorSelect.addEventListener("change", renderLayers);
  embroiderySelect.addEventListener("change", renderLayers);
  stripeOption.addEventListener("change", () => {
    updateStripeControls();
    if (stripeOption.checked) {
      centerDecorSelect.disabled = true;
      embroiderySelect.disabled = true;
      embroideryEnable.disabled = true;
      centerDecorSelect.value = "Без отделки по центру.svg";
    } else {
      embroideryEnable.disabled = false;
      updateEmbroideryControls();
    }
    renderLayers();
  });
  stripeColorSelect.addEventListener("change", renderLayers);
  logoEnable.addEventListener("change", () => {
    logoSelect.disabled = !logoEnable.checked;
    renderLayers();
  });
  logoSelect.addEventListener("change", renderLayers);
  centerSelect.addEventListener("change", () => {
    const selectedOption = centerSelect.selectedOptions[0];
    const type = selectedOption ? selectedOption.dataset.type : "otdelka";
    if (
      type === "bezotdelka" &&
      !centerLaminCheckbox.checked &&
      !centerPerfaCheckbox.checked
    ) {
      centerDecorSelect.value = "Без отделки по центру.svg";
      centerDecorSelect.disabled = true;
      embroideryEnable.checked = false;
      embroideryEnable.disabled = true;
      embroiderySelect.disabled = true;
    } else {
      centerDecorSelect.disabled = false;
      embroideryEnable.disabled = false;
      embroiderySelect.disabled = !embroideryEnable.checked;
    }
    renderLayers();
  });
  insertEnable.addEventListener("change", () => {
    insertColorSelect.disabled = !insertEnable.checked;
    renderLayers();
  });
  insertColorSelect.addEventListener("change", renderLayers);
  centerDecorSelect.addEventListener("change", renderLayers);
  innerInsertCheckbox.addEventListener("change", renderLayers);
  headrestSelect.addEventListener("change", renderLayers);
  centerLaminColorSelect.addEventListener("change", renderLayers);
  centerPerfaColorSelect.addEventListener("change", renderLayers);

  // === БЛОК: Логика блокировки чекбоксов и select-ов для полосы ===
  function updateStripeControls() {
    if (stripeOption.checked) {
      stripeColorSelect.disabled = false;
      embroiderySelect.disabled = true;
      embroiderySelect.value = "";
    } else {
      stripeColorSelect.disabled = true;
      embroiderySelect.disabled = false;
      const defaultOption = Array.from(embroiderySelect.options).find(opt =>
        opt.textContent.trim().toLowerCase().includes("без отделки")
      );
      if (defaultOption) embroiderySelect.value = defaultOption.value;
    }
  }

  // === БЛОК: Логика блокировки чекбоксов и select-ов ===
  function updateEmbroideryControls() {
    embroiderySelect.disabled = !embroideryEnable.checked;
    centerDecorSelect.disabled = embroideryEnable.checked;
  }
  embroideryEnable.addEventListener("change", () => {
    updateEmbroideryControls();
    if (!embroideryEnable.checked) {
      embroiderySelect.value = "none.svg";
    }
    renderLayers();
  });
  embroideryEnable.checked = false;
  updateEmbroideryControls();

  // === БЛОК: Для будущих слоёв (например, цветные вставки) ===
  function updateInsertControls() {
    insertColorSelect.disabled = !insertEnable.checked;
  }
  insertEnable.addEventListener("change", () => {
    updateInsertControls();
    renderLayers();
  });
  updateInsertControls();

  // === БЛОК: Заполнение любого select цветами ===
  // (уже выше)

  // === БЛОК: Переменная для возврата центра
  let prevCenterValue = null;

  centerLaminCheckbox.addEventListener("change", () => {
    if (centerLaminCheckbox.checked || centerPerfaCheckbox.checked) {
      if (!prevCenterValue) prevCenterValue = centerSelect.value;
      centerSelect.value = "otdelka/.svg";
    } else if (!centerLaminCheckbox.checked && !centerPerfaCheckbox.checked) {
      if (prevCenterValue) centerSelect.value = prevCenterValue;
      prevCenterValue = null;
    }
    updateInnerInsertLock();
    updateCenterControls();
    centerSelect.dispatchEvent(new Event("change"));
    renderLayers();
  });

  centerPerfaCheckbox.addEventListener("change", () => {
    if (centerLaminCheckbox.checked || centerPerfaCheckbox.checked) {
      if (!prevCenterValue) prevCenterValue = centerSelect.value;
      centerSelect.value = "bezotdelka/.svg";
    } else if (!centerLaminCheckbox.checked && !centerPerfaCheckbox.checked) {
      if (prevCenterValue) centerSelect.value = prevCenterValue;
      prevCenterValue = null;
    }
    updateInnerInsertLock();
    updateCenterControls();
    centerSelect.dispatchEvent(new Event("change"));
    renderLayers();
  });

  function saveImage() {
    // Размеры в пикселях для 210мм x 297мм при 96dpi (стандарт браузера)
    const pxWidth = Math.round(210 / 25.4 * 96);  // ≈ 794
    const pxHeight = Math.round(297 / 25.4 * 96); // ≈ 1123

    const seat = document.getElementById("seatPreview");
    const clone = seat.cloneNode(true);

    // Не удаляем все стили! Только pointer-events и transform
    clone.querySelectorAll("*").forEach(el => {
      el.style.pointerEvents = "none";
      el.style.transform = "none";
      el.style.objectFit = "contain";
      // el.removeAttribute("style"); // УБРАТЬ!
    });

    // Корректируем SVG
    clone.querySelectorAll("svg").forEach(svg => {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("preserveAspectRatio", "none");
    });

    // Временный контейнер с нужными размерами
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = pxWidth + "px";
    tempContainer.style.height = pxHeight + "px";
    tempContainer.style.background = "transparent";
    clone.style.width = pxWidth + "px";
    clone.style.height = pxHeight + "px";
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    html2canvas(clone, {
      backgroundColor: null,
      width: pxWidth,
      height: pxHeight,
      useCORS: true
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = "seat.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      document.body.removeChild(tempContainer);
    });
  }

  // Привязка к кнопке
  document.getElementById("saveImageBtn").addEventListener("click", saveImage);
});
