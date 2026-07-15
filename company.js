const params = new URLSearchParams(window.location.search);
const companyId = params.get("id");

fetch("./data/directory-data.json")
  .then(response => response.json())
  .then(data => {
    const companyProducts = data.filter(item => item.company_id === companyId);

    if (companyProducts.length === 0) {
      document.getElementById("companyDetail").innerHTML = `
        <p>Company information not found.</p>
        <a href="index.html">Back to Directory</a>
      `;
      return;
    }

    renderDetail(companyProducts);
  });

function renderDetail(products) {
  const first = products[0];

  const displaySource =
  first.source_sheet === "EV_디렉토리"
    ? "EV TREND KOREA 2026"
    : first.source_sheet === "AME_디렉토리"
    ? "AME 2026"
    : "";

  const detail = document.getElementById("companyDetail");

  detail.innerHTML = `
    <div class="detail-hero">
      <div class="detail-title-area">
        ${displaySource ? `<span class="category-badge">${displaySource}</span>` : ""}
        <h1>${first.company_en || first.company_ko}</h1>

        <div class="company-intro-inline">
          <p>${first.company_desc_en || ""}</p>
          <p>${first.company_desc_ko || ""}</p>
        </div>
      </div>

      <div class="detail-logo-wrap">
        ${first.logo ? `
          <img
            src="${getImageBasePath(first.logo)}.png"
            alt="${first.company_en || first.company_ko}"
            onerror="tryNextImage(this, '${first.logo}')"
          >
        ` : ""}
      </div>
    </div>

    <div class="detail-actions">
      ${first.meeting_request_url ? `
        <a class="meeting-btn" href="${first.meeting_request_url}" target="_blank">Meeting Request</a>
      ` : ""}
      ${first.website ? `
        <a class="outline-btn" href="${first.website}" target="_blank">Website</a>
      ` : ""}
    </div>

    <section class="product-detail-wrap">
      ${products.map(product => `
        <article class="product-detail-card">
          <div class="product-card-image">
            ${product.image ? `
              <img 
                src="${getImageBasePath(product.image)}.png"
                alt="${product.product_en || product.product_ko}"
                onerror="tryNextImage(this, '${product.image}')"
              >
            ` : ""}
          </div>

          <div class="product-card-content">
            <h2>${product.product_en || product.product_ko || ""}</h2>

            ${product.product_en && product.product_ko ? `
              <p class="product-name-ko">${product.product_ko}</p>
            ` : ""}

            <div class="product-description collapsed">
              <p>${product.description_en || ""}</p>
              <p>${product.description_ko || ""}</p>
            </div>

            <button class="read-more-btn" onclick="toggleDescription(this)">
              Read More
            </button>

            ${renderVideoButtons(product.video)}
          </div>
        </article>
      `).join("")}
    </section>
  `;
  setReadMoreVisibility();
}

function renderVideoButtons(videoList) {
  if (!Array.isArray(videoList) || videoList.length === 0) return "";

  return `
    <div class="product-video-buttons">
      ${videoList.map((url, index) => `
        <a class="outline-btn" href="${url}" target="_blank">
          ${videoList.length === 1 ? "Video" : "Video " + (index + 1)}
        </a>
      `).join("")}
    </div>
  `;
}

function getImageBasePath(path) {
  if (!path) return "";
  return path.replace(/\.(png|jpg|jpeg|webp)$/i, "");
}

function tryNextImage(img, basePath) {
  basePath = getImageBasePath(basePath);

  const currentSrc = img.getAttribute("src");

  if (currentSrc.endsWith(".png")) {
    img.src = basePath + ".jpg";
  } else if (currentSrc.endsWith(".jpg")) {
    img.src = basePath + ".jpeg";
  } else if (currentSrc.endsWith(".jpeg")) {
    img.src = basePath + ".webp";
  } else {
    img.style.display = "none";
  }
}

function toggleDescription(button) {
  const desc = button.previousElementSibling;

  desc.classList.toggle("collapsed");

  button.textContent = desc.classList.contains("collapsed")
    ? "Read More"
    : "Show Less";
}

function setReadMoreVisibility() {
  document.querySelectorAll(".product-description").forEach(desc => {
    const btn = desc.nextElementSibling;

    if (!btn || !btn.classList.contains("read-more-btn")) return;

    if (desc.scrollHeight > desc.clientHeight + 2) {
      btn.style.display = "inline-block";
    } else {
      btn.style.display = "none";
    }
  });
}
