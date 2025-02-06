const apiKey = 'd1cfa09d-ef66-4548-a6e6-34e759ab0c84'; // Вставь свой API ключ
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Прокси сервер

// Массив с городами
const cities = [
    "Минск", "Орша", "Молодечно", "Борисов", "Барановичи", "Гродно", "Лида", "Лунинец",
    "Брест", "Пинск", "Гомель", "Калинковичи", "Жлобин", "Могилев", "Кричев", "Осиповичи",
    "Бобруйск", "Витебск", "Полоцк"
];

// Коды станций
const cityCodes = {
    "Минск": "s9600216",
    "Орша": "s9600060",
    "Молодечно": "s9600230",
    "Борисов": "s9600406",
    "Барановичи": "s9600173",
    "Гродно": "s9600113",
    "Лида": "s9600069",
    "Лунинец": "s9600466",
    "Брест": "s9600140",
    "Пинск": "s9600192",
    "Гомель": "s9600228",
    "Калинковичи": "s9600222",
    "Жлобин": "s9600067",
    "Могилев": "s9600170",
    "Кричев": "s9600311",
    "Осиповичи": "s9600178",
    "Бобруйск": "s9600153",
    "Витебск": "s9600224",
    "Полоцк": "s9600294"
};

// Функция для заполнения выпадающего списка городов
function populateCitySelect() {
    const citySelect = document.getElementById("citySelect");
    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    // При изменении города обновляем расписание
    citySelect.addEventListener("change", updateSchedule);
}

// Функция для получения данных с расписанием поездов
async function fetchTrainSchedule(cityCode, date) {
    try {
        const url = `${proxyUrl}https://api.rasp.yandex.net/v3.0/schedule/?apikey=${apiKey}&station=${cityCode}&transport_type=train&date=${date}`;
        const response = await fetch(url);

        // Проверяем успешность запроса
        if (!response.ok) {
            throw new Error("Ошибка при загрузке данных");
        }

        const data = await response.json();

        // Выводим полный ответ API в консоль для дебага
        console.log("Ответ API:", data);

        return data;
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    }
}

// Функция для отображения расписания поездов
function displayTrainSchedule(schedule) {
    const trainTable = document.getElementById("trainTable");
    trainTable.innerHTML = ''; // Очистить таблицу

    schedule.forEach(train => {
        const row = document.createElement("tr");

        const trainNumber = document.createElement("td");
        trainNumber.textContent = train.train.num;
        row.appendChild(trainNumber);

        const route = document.createElement("td");
        route.textContent = `${train.station_from.title} - ${train.station_to.title}`;
        row.appendChild(route);

        const arrival = document.createElement("td");
        arrival.textContent = train.arrival;
        row.appendChild(arrival);

        const stop = document.createElement("td");
        stop.textContent = train.stop;
        row.appendChild(stop);

        const departure = document.createElement("td");
        departure.textContent = train.departure;
        row.appendChild(departure);

        trainTable.appendChild(row);
    });
}

// Функция для обновления расписания
async function updateSchedule() {
    const citySelect = document.getElementById("citySelect");
    const city = citySelect.value;
    const date = document.getElementById("dateSelect").value;

    // Получаем код станции для города
    const cityCode = cityCodes[city];

    if (!cityCode) {
        console.error("Код города не найден:", city);
        return;
    }

    // Выводим код города в консоль для проверки
    console.log("Используем код города:", cityCode);

    const data = await fetchTrainSchedule(cityCode, date);
    if (data && data.schedule) {
        displayTrainSchedule(data.schedule);
    } else {
        console.error("Ошибка в данных расписания");
    }
}

// Инициализация страницы
document.addEventListener("DOMContentLoaded", function() {
    populateCitySelect();
});
