const API_URL = window.location.origin;

const restaurantList = document.getElementById("restaurant-list");
const restaurantForm = document.getElementById("restaurant-form");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const ratingInput = document.getElementById("rating");
const restaurantImageInput = document.getElementById("restaurant-image");
const authForm = document.getElementById("auth-form");
const authNameInput = document.getElementById("auth-name");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const registerButton = document.getElementById("register-button");
const loginButton = document.getElementById("login-button");
const message = document.getElementById("message");
const loadingWrap = document.getElementById("loading-wrap");
const refreshButton = document.getElementById("refresh-button");
const restaurantCount = document.getElementById("restaurant-count");
const usersPanel = document.getElementById("users-panel");
const restaurantsPanel = document.getElementById("restaurants-panel");
const restaurantListPanel = document.getElementById("restaurant-list-panel");
const dishesPanel = document.getElementById("dishes-panel");
const dishesListPanel = document.getElementById("dishes-list-panel");
const dishForm = document.getElementById("dish-form");
const dishRestaurantInput = document.getElementById("dish-restaurant");
const dishNameInput = document.getElementById("dish-name");
const dishDescriptionInput = document.getElementById("dish-description");
const dishPriceInput = document.getElementById("dish-price");
const dishImageInput = document.getElementById("dish-image");
const dishList = document.getElementById("dish-list");
const profilePanel = document.getElementById("profile-panel");
const profileForm = document.getElementById("profile-image-form");
const profileImageInput = document.getElementById("profile-image-file");
const profileImage = document.getElementById("profile-image");
const profilePlaceholder = document.getElementById("profile-placeholder");
const logoutButton = document.getElementById("logout-button");
const tabButtons = document.querySelectorAll(".tab-button");
let activeTab = "users";

function showMessage(type, text) {
  message.className = `message show ${type}`;
  message.textContent = text;
}

function clearMessage() {
  message.className = "message";
  message.textContent = "";
}

function showLoading(visible) {
  loadingWrap.classList.toggle("visible", visible);
}

function setActiveTab(tab) {
  activeTab = tab;
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  usersPanel.classList.toggle("hidden-panel", tab !== "users");
  restaurantsPanel.classList.toggle("hidden-panel", tab !== "restaurants");
  restaurantListPanel.classList.toggle("hidden-panel", tab !== "restaurants");
  dishesPanel.classList.toggle("hidden-panel", tab !== "dishes");
  dishesListPanel.classList.toggle("hidden-panel", tab !== "dishes");
  if (tab === "restaurants" || tab === "dishes") fetchRestaurants();
}

function getTokenHeaders() {
  const headers = {};
  const token = localStorage.getItem("easyfood_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function getAuthHeaders() {
  return { "Content-Type": "application/json", ...getTokenHeaders() };
}

function publicImageUrl(imageUrl, ownerType) {
  const prefix = `/uploads/${ownerType}/`;
  return typeof imageUrl === "string" && imageUrl.startsWith(prefix)
    ? `${API_URL}${imageUrl}`
    : "";
}

function renderRestaurants(restaurants) {
  restaurantList.innerHTML = "";

  if (!restaurants.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<span class="empty-icon">🍽️</span><p>Sem restaurantes cadastrados.</p>`;
    restaurantList.appendChild(empty);
    restaurantCount.textContent = "0";
    return;
  }

  restaurants.forEach((restaurant) => {
    const card = document.createElement("article");
    card.className = "restaurant-card";

    const id = restaurant.id;
    const rating = Number(restaurant.rating || 0);
    const stars = rating >= 4 ? "★★★★☆" : rating >= 3 ? "★★★☆☆" : "★★☆☆☆";
    const photoUrl = publicImageUrl(restaurant.imageUrl, "restaurants");
    const avatar = photoUrl
      ? `<img class="restaurant-photo" src="${escapeHtml(photoUrl)}" alt="Foto de ${escapeHtml(restaurant.name)}" />`
      : "🍽️";

    card.innerHTML = `
      <div class="restaurant-card-main">
        <div class="restaurant-avatar">${avatar}</div>
        <div class="restaurant-data">
          <h3 class="restaurant-title">${escapeHtml(restaurant.name)}</h3>
          <p class="restaurant-category">${escapeHtml(restaurant.category)}</p>
          <div class="restaurant-rating">
            <span class="stars">${stars}</span>
            <span class="rating-value">${rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <button class="delete-button" data-id="${id}" aria-label="Deletar ${escapeHtml(restaurant.name)}">×</button>
    `;

    restaurantList.appendChild(card);
  });

  restaurantCount.textContent = restaurants.length;
}

function updateDishRestaurantOptions(restaurants) {
  if (!restaurants.length) {
    dishRestaurantInput.innerHTML = '<option value="">Nenhum restaurante cadastrado</option>';
    dishRestaurantInput.disabled = true;
    return;
  }

  const previousValue = dishRestaurantInput.value;
  dishRestaurantInput.disabled = false;
  dishRestaurantInput.innerHTML = restaurants.map((restaurant) =>
    `<option value="${restaurant.id}">${escapeHtml(restaurant.name)}</option>`
  ).join("");
  dishRestaurantInput.value = restaurants.some((restaurant) => String(restaurant.id) === previousValue)
    ? previousValue
    : String(restaurants[0].id);
}

function renderDishes(dishes) {
  if (!dishes.length) {
    dishList.innerHTML = '<div class="empty-state"><span class="empty-icon">🍲</span><p>Este restaurante ainda não tem pratos cadastrados.</p></div>';
    return;
  }

  dishList.innerHTML = dishes.map((dish) => {
    const imageUrl = publicImageUrl(dish.imageUrl, "dishes");
    const photo = imageUrl
      ? `<img class="dish-photo" src="${escapeHtml(imageUrl)}" alt="Foto de ${escapeHtml(dish.name)}" />`
      : '<div class="dish-photo-placeholder" aria-hidden="true">🍽️</div>';
    const price = Number(dish.price).toFixed(2);
    return `
      <article class="dish-card">
        ${photo}
        <div class="dish-card-content">
          <h3>${escapeHtml(dish.name)}</h3>
          <p class="dish-description">${escapeHtml(dish.description)}</p>
          <p class="dish-price">R$ ${price.replace(".", ",")}</p>
          <form class="dish-image-upload" data-dish-id="${dish.id}">
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp" aria-label="Imagem de ${escapeHtml(dish.name)}" required />
            <button type="submit">${imageUrl ? "Trocar imagem" : "Enviar imagem"}</button>
          </form>
        </div>
      </article>
    `;
  }).join("");
}

async function loadDishes() {
  const restaurantId = dishRestaurantInput.value;
  if (!restaurantId) {
    dishList.innerHTML = '<div class="empty-state"><span class="empty-icon">🍽️</span><p>Cadastre um restaurante antes de adicionar pratos.</p></div>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/dishes`);
    const data = await response.json().catch(() => []);
    if (!response.ok) throw new Error(data.error || "Não foi possível carregar o cardápio");
    renderDishes(data);
  } catch (error) {
    dishList.innerHTML = `<div class="empty-state"><p>${escapeHtml(error.message || "Erro ao carregar pratos")}</p></div>`;
  }
}

async function fetchRestaurants() {
  showLoading(true);
  clearMessage();

  try {
    const response = await fetch(`${API_URL}/restaurants`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar os restaurantes");
    }

    const restaurants = await response.json();
    renderRestaurants(restaurants);
    updateDishRestaurantOptions(restaurants);
    if (activeTab === "dishes") await loadDishes();
  } catch (error) {
    showMessage("error", error.message || "Erro ao carregar restaurantes");
  } finally {
    showLoading(false);
  }
}

async function loadProfile() {
  const token = localStorage.getItem("easyfood_token");
  if (!token) {
    profilePanel.classList.add("hidden-panel");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getTokenHeaders()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      localStorage.removeItem("easyfood_token");
      profilePanel.classList.add("hidden-panel");
      return;
    }

    profilePanel.classList.remove("hidden-panel");
    const photoUrl = publicImageUrl(data.user?.imageUrl, "profiles");
    profileImage.classList.toggle("hidden-panel", !photoUrl);
    profilePlaceholder.classList.toggle("hidden-panel", Boolean(photoUrl));
    if (photoUrl) profileImage.src = photoUrl;
    else profileImage.removeAttribute("src");
  } catch {
    profilePanel.classList.add("hidden-panel");
  }
}

async function handleAuth(action) {
  const name = authNameInput.value.trim();
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!email || !password) {
    showMessage("error", "Email e senha são obrigatórios");
    return;
  }

  if (action === "register" && !name) {
    showMessage("error", "Nome é obrigatório para cadastro");
    return;
  }

  showLoading(true);
  clearMessage();

  try {
    const response = await fetch(`${API_URL}/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "register" ? { name, email, password } : { email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Erro ao ${action === "register" ? "cadastrar" : "logar"}`);
    }

    if (data.token) {
      localStorage.setItem("easyfood_token", data.token);
      await loadProfile();
      showMessage("success", "Login realizado com sucesso");
    } else {
      showMessage("success", action === "register" ? "Usuário cadastrado com sucesso. Faça login para enviar sua foto." : "Operação concluída");
    }

    authForm.reset();
  } catch (error) {
    showMessage("error", error.message || "Erro na autenticação");
  } finally {
    showLoading(false);
  }
}

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleAuth("register");
});

registerButton.addEventListener("click", (event) => {
  event.preventDefault();
  handleAuth("register");
});

loginButton.addEventListener("click", (event) => {
  event.preventDefault();
  handleAuth("login");
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const image = profileImageInput.files[0];
  if (!image) {
    showMessage("error", "Selecione uma imagem para o perfil");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/auth/me/image`, {
      method: "POST",
      headers: getTokenHeaders(),
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Erro ao enviar foto do perfil");
    profileImageInput.value = "";
    await loadProfile();
    showMessage("success", "Foto do perfil atualizada");
  } catch (error) {
    showMessage("error", error.message);
  } finally {
    showLoading(false);
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("easyfood_token");
  profilePanel.classList.add("hidden-panel");
  showMessage("success", "Sessão encerrada");
});

restaurantForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const rating = Number(ratingInput.value);

  if (!name || !category) {
    showMessage("error", "Nome e categoria são obrigatórios");
    return;
  }

  if (rating < 0 || rating > 5) {
    showMessage("error", "A avaliação deve estar entre 0 e 5");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("category", category);
  formData.append("rating", String(rating));
  if (restaurantImageInput.files[0]) formData.append("image", restaurantImageInput.files[0]);

  showLoading(true);
  clearMessage();

  try {
    const response = await fetch(`${API_URL}/restaurants`, {
      method: "POST",
      headers: getTokenHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erro ao criar restaurante");
    }

    restaurantForm.reset();
    ratingInput.value = 4.5;
    showMessage("success", "Restaurante criado com sucesso");
    await fetchRestaurants();
  } catch (error) {
    showMessage("error", error.message || "Erro ao criar restaurante");
  } finally {
    showLoading(false);
  }
});

dishRestaurantInput.addEventListener("change", loadDishes);

dishForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = localStorage.getItem("easyfood_token");
  if (!token) {
    showMessage("error", "Faça login antes de cadastrar um prato.");
    return;
  }

  const restaurantId = dishRestaurantInput.value;
  if (!restaurantId) {
    showMessage("error", "Cadastre um restaurante antes de adicionar pratos.");
    return;
  }

  const payload = {
    name: dishNameInput.value.trim(),
    description: dishDescriptionInput.value.trim(),
    price: Number(dishPriceInput.value)
  };
  if (!payload.name || !payload.description || !Number.isFinite(payload.price) || payload.price <= 0) {
    showMessage("error", "Informe nome, descrição e um preço válido para o prato.");
    return;
  }

  showLoading(true);
  clearMessage();
  try {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/dishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const dish = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(dish.error || "Erro ao cadastrar prato");

    if (dishImageInput.files[0]) {
      const formData = new FormData();
      formData.append("image", dishImageInput.files[0]);
      const imageResponse = await fetch(`${API_URL}/dishes/${dish.id}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const imageResult = await imageResponse.json().catch(() => ({}));
      if (!imageResponse.ok) {
        await loadDishes();
        throw new Error(`Prato cadastrado, mas a imagem não foi enviada: ${imageResult.error || "tente novamente"}`);
      }
    }

    const createdForRestaurant = dishRestaurantInput.value;
    dishForm.reset();
    dishRestaurantInput.value = createdForRestaurant;
    await loadDishes();
    showMessage("success", "Prato cadastrado com sucesso.");
  } catch (error) {
    showMessage("error", error.message || "Erro ao cadastrar prato");
  } finally {
    showLoading(false);
  }
});

dishList.addEventListener("submit", async (event) => {
  const imageForm = event.target.closest(".dish-image-upload");
  if (!imageForm) return;
  event.preventDefault();

  const token = localStorage.getItem("easyfood_token");
  if (!token) {
    showMessage("error", "Faça login antes de enviar uma imagem.");
    return;
  }

  const image = imageForm.querySelector('input[type="file"]').files[0];
  if (!image) {
    showMessage("error", "Selecione uma imagem para o prato.");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/dishes/${imageForm.dataset.dishId}/image`, {
      method: "POST",
      headers: getTokenHeaders(),
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Erro ao enviar imagem do prato");
    await loadDishes();
    showMessage("success", "Imagem do prato atualizada.");
  } catch (error) {
    showMessage("error", error.message || "Erro ao enviar imagem do prato");
  } finally {
    showLoading(false);
  }
});

restaurantList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest(".delete-button");
  if (!deleteButton) return;

  const id = deleteButton.dataset.id;
  showLoading(true);
  clearMessage();
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Erro ao deletar restaurante");
    showMessage("success", "Restaurante removido com sucesso");
    await fetchRestaurants();
  } catch (error) {
    showMessage("error", error.message || "Erro ao deletar restaurante");
  } finally {
    showLoading(false);
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

refreshButton.addEventListener("click", fetchRestaurants);

setActiveTab("users");
fetchRestaurants();
loadProfile();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
