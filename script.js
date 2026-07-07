let products = [];
let companies = [];
let currentCategory = "All";

fetch("./data/directory-data.json")
  .then(response => response.json())
  .then(data => {
    products = data;
    companies = groupByCompany(products);
    renderFilters();
    renderCompanies();
  })
  .catch(error => {
    console.error("JSON loading error:", error);
  });

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  renderCompanies();
});

function groupByCompany(data) {
  const map = {};

  data.forEach(item => {
    const companyId = item.company_id;

    if (!map[companyId]) {
      map[companyId] = {
        company_id: item.company_id,
        company_ko: item.company_ko,
        company_en: item.company_en,
        company_desc_ko: item.company_desc_ko,
        company_desc_en: item.company_desc_en,
        website: item.website,
        logo: item.logo,
        products: [],
        categories: []
      };
    }

    map[companyId].products.push(item);

    const itemCategories = getCategoryArray(item);
    map[companyId].categories.push(...itemCategories);
  });

  return Object.values(map).map(company => {
    company.categories = [...new Set(company.categories)];
    return company;
  });
}

function getCategoryArray(item) {
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    return item.categories;
  }

  if (!item.category) return [];

  return item.category
    .split(",")
    .map(category => category.trim())
    .filter(Boolean);
}

function renderFilters() {
  const filterWrap = document.getElementById("categoryFilters");

  const allCategories = companies
    .flatMap(company => company.categories)
    .filter(Boolean);

  const categories = ["All", ...new Set(allCategories)];

  filterWrap.innerHTML = categories.map(category => `
    <button class="filter-btn ${category === "All" ? "active" : ""}" onclick="setCategory('${category}')">
      ${category}
    </button>
  `).join("");
}

function setCategory(category) {
  currentCategory = category;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent.trim() === category) {
      btn.classList.add("active");
    }
  });

  renderCompanies();
}

function renderCompanies() {
  const grid = document.getElementById("companyGrid");
  const resultCount = document.getElementById("resultCount");
  const keyword = searchInput.value.toLowerCase();

  const filtered = companies.filter(company => {
    const searchableText = `
      ${company.company_ko}
      ${company.company_en}
      ${company.company_desc_ko}
      ${company.company_desc_en}
      ${company.categories.join(" ")}
      ${company.products.map(product => `
        ${product.product_ko}
        ${product.product_en}
        ${product.description_ko}
        ${product.description_en}
        ${product.category}
      `).join(" ")}
    `.toLowerCase();

    const matchesKeyword = searchableText.includes(keyword);

    const matchesCategory =
      currentCategory === "All" ||
      company.categories.includes(currentCategory);

    return matchesKeyword && matchesCategory;
  });

  resultCount.textContent = filtered.length;

  grid.innerHTML = filtered.map(company => {
    const firstProduct = company.products[0];

    return `
      <article class="company-card">
        <div class="card-image logo-image">
          ${company.logo ? `
            <img src="${company.logo}.png" alt="${company.company_en || company.company_ko}" onerror="tryNextImage(this, '${company.logo}')">` : ""}
        </div>

        <div class="card-body">
          <h2 class="company-name-ko">
            ${company.company_ko || ""}
          </h2>

          ${company.company_en ? `
          <p class="company-name-en">
            ${company.company_en}
          </p>
          ` : ""}

          <div class="category-chip-wrap">
            ${company.categories.map(category => `
              <span class="category-badge">${category}</span>
            `).join("")}
          </div>

          <div class="product-list">
            ${company.products.map(product => `
              <div class="product-list-item">
                ${product.product_en || product.product_ko || ""}
              </div>
            `).join("")}
          </div>

          <div class="card-actions">
            <a class="detail-btn" href="company.html?id=${company.company_id}">
              View Details
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function tryNextImage(img, basePath) {
  const currentSrc = img.getAttribute("src");

  if (currentSrc.endsWith(".png")) {
    img.src = basePath + ".jpg";
  } else if (currentSrc.endsWith(".jpg")) {
    img.src = basePath + ".jpeg";
  } else {
    img.style.display = "none";
  }
}