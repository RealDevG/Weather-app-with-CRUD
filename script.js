document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const search = document.getElementById("searchbtn");
  const currentWeather = document.querySelector(".current-weather");
  const bookmarks = document.querySelector(".bookmarks");

  //

  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  // Toggle dropdown visibility
  dropdownToggle.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  // Render bookmarks into dropdown
  function renderDropdownBookmarks() {
    dropdownMenu.innerHTML = ""; // Clear existing
    savedWeathers.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add(
        "flex",
        "flex-col",
        "justify-between",
        "items-center",
        "p-2",
        "hover:bg-gray-100",
        "cursor-pointer"
      );

      li.innerHTML = `
      <span>${item.area} - ${item.temp}°C</span>
      <button class="text-red-600 text-lg font-bold" data-id="${item.id}">×</button>
    `;

      dropdownMenu.appendChild(li);
    });

    // Handle remove from dropdown
    dropdownMenu.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.target.getAttribute("data-id");
        savedWeathers = savedWeathers.filter((item) => item.id !== id);
        saveInLocal();
        renderDropdownBookmarks();
        renderBookmarks();

        document.querySelector(`button#${id}`)?.closest(".one")?.remove(); // Remove from main display too
      });
    });
  }

  const API_KEY = YOUR_API_KEY;

  let savedWeathers = JSON.parse(localStorage.getItem("myWeather")) || [];

  const getweatherdata = async (city) => {
    const url = `https://api.weatherstack.com/current?access_key=${API_KEY}&query=${city}`;
    try {
      const respone = await fetch(url);
      const data = await respone.json();
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  savedWeathers.forEach(async (element) => {
    renderBookmarks();
    renderDropdownBookmarks();
  });

  function renderBookmarks() {
    bookmarks.innerHTML = ""; // Clear existing bookmarks

    savedWeathers.forEach((object) => {
      const container = document.createElement("div");
      container.classList.add(
        "one",
        "bg-white",
        "text-xl",
        "rounded-full",
        "px-9",
        "py-3",
        "relative",
        "transition-all",
        "duration-300"
      );

      const contentWrapper = document.createElement("div");
      contentWrapper.classList.add(
        "bookmark-content",
        "transition-opacity",
        "duration-300",
        "opacity-100"
      );

      const ul = document.createElement("ul");
      ul.classList.add("flex", "gap-3", "items-center", "justify-center");

      const tempLi = document.createElement("li");
      tempLi.classList.add("bg-amber-500", "p-3", "rounded-full", "shadow-2xs");
      tempLi.textContent = `${object.temp}°C`;

      const locationLi = document.createElement("li");
      locationLi.textContent = `${object.area}`;
      locationLi.classList.add("mylocation");

      ul.appendChild(tempLi);
      ul.appendChild(locationLi);
      contentWrapper.appendChild(ul);
      container.appendChild(contentWrapper);

      const hoverTempDiv = document.createElement("div");
      hoverTempDiv.classList.add(
        "hover-temp",
        "absolute",
        "inset-0",
        "flex",
        "items-center",
        "justify-center",
        "text-3xl",
        "font-bold",
        "opacity-0",
        "transition-opacity",
        "duration-500"
      );
      container.appendChild(hoverTempDiv);

      bookmarks.appendChild(container);

      container.addEventListener("mouseenter", async (e) => {
        const locationEl = e.currentTarget.querySelector(".mylocation");
        try {
          const hoverData = await getweatherdata(locationEl.textContent);
          const hoverTemp = hoverData.current.temperature;

          hoverTempDiv.textContent = `${hoverTemp}°C`;
          contentWrapper.classList.replace("opacity-100", "opacity-0");
          hoverTempDiv.classList.replace("opacity-0", "opacity-100");
        } catch (err) {
          console.log("Error fetching weather");
        }
      });

      container.addEventListener("mouseleave", () => {
        contentWrapper.classList.replace("opacity-0", "opacity-100");
        hoverTempDiv.classList.replace("opacity-100", "opacity-0");
      });
    });
  }

  function saveInLocal() {
    localStorage.setItem("myWeather", JSON.stringify(savedWeathers));
  }
  function addBookmarks(temp, area) {
    const data = {
      id: `${Date.now()}`,
      temp: temp,
      area: area,
    };
    savedWeathers.push(data);
    saveInLocal();
    renderBookmarks();
    renderDropdownBookmarks();
  }
  async function renderCurrentWeather(city) {
    const data = await getweatherdata(city);

    const markBtn = document.createElement("button");
    const icon = document.createElement("div");
    const main = document.createElement("div");
    const region = document.createElement("div");

    icon.innerHTML = `
        <img src=${data.current.weather_icons[0]}/>
`;
    console.log(data.current.weather_icons[0]);
    icon.classList.add("mx-4", "w-5", "h-5");
    main.classList.add("mx-5");
    region.classList.add("mx-5");
    markBtn.textContent = "add";
    markBtn.classList.add(
      "absolute",
      "right-2",
      "mx-6",
      "text-xs",
      "bg-green-600",
      "text-white",
      "rounded-full",
      "flex",
      "items-center",
      "justify-center",
      "shadow-lg",
      "w-10",
      "h-10",
      "hover:bg-green-700",
      "cursor-pointer"
    );

    const ul = document.createElement("ul");
    ul.innerHTML = `
    <li>${data.current.temperature}°C</li>
    <li>${data.current.weather_descriptions[0]}</li>
    `;
    ul.classList.add("flex", "flex-col", "gap-3");
    main.classList.add("flex", "flex-col");
    main.appendChild(ul);
    region.innerHTML = `${data.location.name}`;
    currentWeather.classList.add(
      "flex",
      "bg-sky-500",
      "px-10",
      "py-7",
      "text-white",
      "gap-3"
    );
    currentWeather.classList.add(
      //slight delay to appear the content
      "opacity-0",
      "transition",
      "duration-500",
      "ease-in-out",
      "transform",
      "scale-90"
    );

    currentWeather.innerHTML = "";

    currentWeather.appendChild(icon);
    currentWeather.appendChild(main);
    currentWeather.appendChild(region);
    currentWeather.appendChild(markBtn);

    setTimeout(() => {
      currentWeather.classList.remove("opacity-0", "scale-90");
      currentWeather.classList.add("opacity-100", "scale-100");
    }, 10);

    markBtn.addEventListener("click", () => {
      addBookmarks(data.current.temperature, data.location.name);
    });
  }

  search.addEventListener("click", (e) => {
    e.preventDefault();
    const city = input.value;
    input.value = "";
    if (!city) {
      console.log("enter location please");
    } else {
      // getweatherdata(city)
      renderCurrentWeather(city);
    }
  });
});
