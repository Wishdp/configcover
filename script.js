document.addEventListener("DOMContentLoaded", () => {
  // === БЛОК: Получение элементов управления ===
  const baseColorSelect = document.getElementById("baseColorSelect");
  const designSelect = document.getElementById("designSelect");
  const layers = document.getElementById("layers");
  const stitchColorSelect = document.getElementById("stitchColorSelect");
  const embroiderySelect = document.getElementById("embroiderySelect");
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

  // === БЛОК: Порядок слоёв для отображения ===
  const layerOrder = [
    "centerLamin",
    "centerPerfa",
    "center",
    "base",
    "embroidery",
    "stripe",
    "logo",
    "insert", 
    "stitching"
  ];

  // === БЛОК: Очистка всех слоёв ===
  function clearAllLayers() {
    while (layers.firstChild) {
      layers.removeChild(layers.firstChild);
    }
  }

  // === БЛОК: Цвета шва (используются для шва и полосы) ===
  const stitchColors = {
    "черная": "#000000",
    "бежевая": "#ffd500",
    "белая": "#fafafa",
    "бирюзовая": "#02b3db",
    "бордовая": "#800101",
    "бронзовая": "#ff4800",
    "желтая": "#ffff00",
    "зеленая": "#006400",
    "коричневая": "#291107",
    "красная": "#ff0000",
    "оранжевая": "#eb5905",
    "розовая": "#f5029c",
    "рыжая": "#ff6600",
    "светло-серая": "#d3d3d3",
    "серая": "#545453",
    "синяя": "#0000ff",
    "голубая": "#006ab5",
    "фиолетовая": "#800080"    
  };

  // === БЛОК: Цвета основы ===
  const baseColors = {
    "кожзам черный": "#000000",
    "кожзам бордовый": "#960606",
    "кожзам желтый": "#ffd608",
    "кожзам зеленый": "#1a7d1e",
    "кожзам коричневый": "#663009",
    "кожзам светло-коричневый": "#b85711",
    "кожзам красный": "#ff0000",
    "кожзам оранж": "#ff8800",
    "кожзам рыжий": "#ff7700",
    "кожзам салатовый": "#4cf702",
    "кожзам слоновая кость": "#dec33c",
    "кожзам светлый беж": "#ffdf40",
    "кожзам светло-серый": "#cccccc",
    "кожзам серый": "#5e5d5d",
    "кожзам ярко синий": "#000bdb",
    "кожзам синий": "#23276e",
    "кожзам хаки": "#0e3804"    
  };

  // === БЛОК: id слоёв основы для перекраски ===
  const baseLayerIds = [
    "path480",
    "path18321",
    "path18465",
    "path17205"
    // Добавь сюда все id, которые нужно перекрашивать в base/*.svg
  ];

  // === БЛОК: id элементов полосы для перекраски ===
  const stripeLayerIds = [
    "path9765"
  ];

  // === БЛОК: События (обработчики интерфейса) ===
  baseColorSelect.addEventListener("change", renderLayers);

  designSelect.addEventListener("change", (e) => {
    clearAllLayers(); // Очищаем все слои сразу при смене дизайна!
    const design = e.target.value.toLowerCase().replace(/ /g, "");
    updateBaseColorOptions(design);
    fillCenterSelect(design).then(() => {
      renderLayers();
    });
  });

  stitchColorSelect.addEventListener("change", renderLayers);

  embroiderySelect.addEventListener("change", renderLayers);

  stripeOption.addEventListener("change", renderLayers);

  stripeColorSelect.addEventListener("change", renderLayers);

  logoEnable.addEventListener("change", () => {
    logoSelect.disabled = !logoEnable.checked;
    renderLayers();
  });

  logoSelect.addEventListener("change", renderLayers);

  centerSelect.addEventListener("change", renderLayers);

  insertEnable.addEventListener("change", () => {
    insertColorSelect.disabled = !insertEnable.checked;
    renderLayers();
  });

  insertColorSelect.addEventListener("change", renderLayers);

  // === БЛОК: Автозагрузка при старте ===
  if (designSelect.value) {
    const design = designSelect.value.toLowerCase().replace(/ /g, "");
    updateBaseColorOptions(design);
    fillCenterSelect(design).then(() => {
      renderLayers();
    });
  }

  // === БЛОК: Заполняем select вышивки и вешаем обработчики ===
  fillEmbroiderySelect().then(() => {
    embroiderySelect.addEventListener("change", renderLayers);
    if (embroiderySelect.value) renderLayers();
  });

  // === БЛОК: Заполняем select логотипов и вешаем обработчики ===
  fillLogoSelect().then(() => {
    logoSelect.disabled = !logoEnable.checked;
    renderLayers();
  });

  // Вызови при старте:
  updateCenterControls();
  updateStripeControls();

  // === БЛОК: Отрисовка всех слоёв только для выбранного дизайна ===
  async function renderLayers() {
    clearAllLayers();
    const design = designSelect.value.toLowerCase().replace(/ /g, "");
    const baseColor = baseColors[baseColorSelect.value] || "#bdbdbd";
    const stitchColor = stitchColors[stitchColorSelect.value] || "#000000";
    const laminColor = centerLaminColorSelect.value;
    const perfaColor = centerPerfaColorSelect.value;

    for (const layer of layerOrder) {
      switch(layer) {
        case "base":
          await updateBaseImage(design, "base.svg", baseColor);
          break;
        case "centerLamin":
          if (centerLaminCheckbox.checked) {
            await updateCenterLamin(design, laminColor);
          }
          break;
        case "centerPerfa":
          if (!centerLaminCheckbox.checked && centerPerfaCheckbox.checked) {
            await updateCenterPerfa(design, perfaColor);
          }
          break;
        case "center":
          if (!centerLaminCheckbox.checked && !centerPerfaCheckbox.checked) {
            await updateCenter(design, centerSelect.value);
          }
          break;
        case "stitching":
          await updateStitching(stitchColor);
          break;
        case "embroidery":
          await updateEmbroidery();
          break;
        case "stripe":
          await updateStripe();
          break;
        case "logo":
          await updateLogo();
          break;
        case "insert":
          if (insertEnable.checked) {
            await updateInsert(design, insertColorSelect.value);
          }
          break;
      }
    }
  }

  // === БЛОК: Очистка слоя по имени ===
  function clearLayer(name) {
    const existing = document.querySelector(`#layers [data-layer="${name}"]`);
    if (existing) existing.remove();
  }

  // === БЛОК: Перекраска основы (base) ===
  async function updateBaseImage(design, fileName, color = "#bdbdbd") {
    clearLayer("base");
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
      layers.appendChild(svg);
    } else {
      const img = document.createElement("img");
      img.src = `images/base/${design}/${fileName}`;
      img.setAttribute("data-layer", "base");
      layers.appendChild(img);
    }
    updateStitching(stitchColors[stitchColorSelect.value] || "#000000");
    updateStripe();
    updateLogo();
  }

  // === БЛОК: Формирование списка цветов основы ===
  async function updateBaseColorOptions(design) {
    baseColorSelect.innerHTML = "";
    Object.keys(baseColors).forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      baseColorSelect.appendChild(option);
    });
    const fileName = "base.svg";
    const firstColor = baseColors[baseColorSelect.value] || "#bdbdbd";
    updateBaseImage(design, fileName, firstColor);
  }

  // === БЛОК: Перекраска шва (stitching) ===
  async function updateStitching(color) {
    clearLayer("stitching");
    const response = await fetch('images/stitching/stitching.svg');
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
    // id нужных элементов для перекраски шва:
    const stitchingIds = ["path2466"]; // <-- сюда id из SVG для шва
    stitchingIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("stroke", color);
        part.style.stroke = color;
        part.setAttribute('stroke-width', '11');
      }
    });
    layers.appendChild(svg);
  }

  // === БЛОК: Перекраска вышивки (embroidery) ===
  async function updateEmbroidery() {
    if (stripeOption.checked) {
      clearLayer("embroidery");
      return;
    }
    const file = embroiderySelect.value;
    const color = stitchColors[stitchColorSelect.value] || "#000000";
    if (!file) return;
    clearLayer("embroidery");
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
    layers.appendChild(svg);
  }

  // === БЛОК: Полоса по центру (stripe) ===
  async function updateStripe() {
    clearLayer("stripe");
    if (!stripeOption.checked) {
      updateEmbroidery();
      return;
    }
    const color = stitchColors[stripeColorSelect.value] || "#ffd500";
    const response = await fetch('images/stripe/stripe.svg');
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
    stripeLayerIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("fill", color);
        part.style.fill = color;
      }
    });
    layers.appendChild(svg);
    clearLayer("embroidery");
  }

  // === БЛОК: Логотип (logo) ===
  async function updateLogo() {
    clearLayer("logo");
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
    layers.appendChild(svg);
  }

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
  async function fillCenterSelect(design) {
    const response = await fetch(`images/centers/${design}/list.json`);
    const files = await response.json();
    centerSelect.innerHTML = "";
    files.forEach(file => {
      const option = document.createElement("option");
      option.value = file;
      option.textContent = file.replace(/\.\w+$/, "");
      centerSelect.appendChild(option);
    });
  }

  // === БЛОК: Отображение выбранного центра ===
  async function updateCenter(design, file) {
    clearLayer("center");
    if (!file) return;
    const img = document.createElement("img");
    img.src = `images/centers/${design}/${file}`;
    img.setAttribute("data-layer", "center");
    img.style.position = "absolute";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    layers.appendChild(img);
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

  centerLaminCheckbox.addEventListener("change", () => {
    updateCenterControls();
    renderLayers();
  });
  centerPerfaCheckbox.addEventListener("change", () => {
    updateCenterControls();
    renderLayers();
  });
  centerLaminColorSelect.addEventListener("change", renderLayers);
  centerPerfaColorSelect.addEventListener("change", renderLayers);

  // === БЛОК: Логика блокировки чекбоксов и select-ов для полосы ===
  function updateStripeControls() {
    if (stripeOption.checked) {
      stripeColorSelect.disabled = false;      // Включить выбор цвета полосы
      embroiderySelect.disabled = true;        // Отключить вышивку
      embroiderySelect.value = "";             // Сбросить выбор вышивки
    } else {
      stripeColorSelect.disabled = true;       // Отключить выбор цвета полосы
      embroiderySelect.disabled = false;       // Включить вышивку
      // По умолчанию выбрать "Без отделки по центру", если такой пункт есть
      const defaultOption = Array.from(embroiderySelect.options).find(opt =>
        opt.textContent.trim().toLowerCase().includes("без отделки")
      );
      if (defaultOption) embroiderySelect.value = defaultOption.value;
    }
  }

  stripeOption.addEventListener("change", () => {
    updateStripeControls();
    renderLayers();
  });

  // === БЛОК: Заполнение любого select цветами ===
  function fillColorSelect(select) {
    select.innerHTML = "";
    Object.keys(baseColors).forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }
  fillColorSelect(baseColorSelect);
  fillColorSelect(centerLaminColorSelect);
  fillColorSelect(centerPerfaColorSelect);
  fillColorSelect(insertColorSelect);

  // === БЛОК: Универсальная перекраска SVG по id ===
  function recolorSvgByIds(svg, ids, color) {
    ids.forEach(id => {
      const el = svg.getElementById(id);
      if (el) el.setAttribute("fill", color);
    });
  }

  // === БЛОК: Функции отрисовки новых центров центр кожзам ===
  async function updateCenterLamin(design, colorName) {
    clearLayer("centerLamin");
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
    const centerLaminIds = ["path2747"]; // <-- id из SVG
    centerLaminIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("fill", color);
        part.style.fill = color;
        part.setAttribute("fill-opacity", "1");
        part.style.fillOpacity = "1";
      }
    });
    layers.appendChild(svg);
  }

  async function updateCenterPerfa(design, colorName) {
    clearLayer("centerPerfa");
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
    const centerPerfaIds = ["path428","path430","path432"]; // <-- сюда id из SVG для перфорации
    centerPerfaIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("fill", color);
        part.style.fill = color;
        part.setAttribute("fill-opacity", "1");
        part.style.fillOpacity = "1";
      }
    });
    layers.appendChild(svg);
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

  async function updateInsert(design, colorName) {
    clearLayer("insert");
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
    const insertIds = ["path2567"]; // id для перекраски
    insertIds.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.setAttribute("fill", color);
        part.style.fill = color;
        part.setAttribute("fill-opacity", "1");
        part.style.fillOpacity = "1";
      }
    });
    layers.appendChild(svg);
  }
});
