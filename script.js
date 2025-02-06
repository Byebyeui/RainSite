const apiKey = "d1cfa09d-ef66-4548-a6e6-34e759ab0c84";
const apiBaseUrl = "https://api.rasp.yandex.net/v3.0";

// Города и их коды станций
const cityCodes = {
    "Минск": "s9600216",
    "Орша": "s9600228",
    "Молодечно": "s9600219",
    "Борисов": "s9600230",
    "Барановичи": "s9600240",
    "Гродно": "s9600250",
    "Лида": "s9600260",
    "Лунинец": "s9600270",
    "Брест": "s9600280",
    "Пинск": "s9600290",
    "Гомель": "s9600300",
    "Калинковичи": "s9600310",
    "Жлобин": "s9600320",
    "Могилев": "s9600330",
    "Кричев": "s9600340",
    "Осиповичи": "s9600350",
    "Бобруйск": "s9600360",
    "Витебск": "s9600370",
    "Полоцк": "s9600380"
};

// Получаем текущую дату в формате YYYY-MM-DD
function getCurrentDate() {
    let now = new Date();
    return now.toISOString().split('T')[0]; // "2025-02-01"
}

// Функция для загрузки расписания поездов
async function fetchTrainSchedule(city, date) {
    let stationCode = cityCodes[city];
    if (!stationCode) {
        console.error("Ошибка: не найден код станции для города", city);
        return;
    }

    let url = `${apiBaseUrl}/schedule/?apikey=${apiKey}&station=${stationCode}&transport_type=train&date=${date}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log("Ответ API:", data); // Проверяем, что пришло

        if (data.schedule && data.schedule.length > 0) {
            updateTable(data.schedule);
        } else {
            console.warn("Нет данных о поездах на выбранный день.");
            document.getElementById("trainTable").innerHTML = "<tr><td colspan='5'>Нет поездов</td></tr>";
        }
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    }
}

// Обновляем таблицу
function updateTable(trains) {
    let now = new Date();
    let trainTable = document.getElementById("trainTable");
    trainTable.innerHTML = ""; // Очищаем таблицу перед обновлением

    // Фильтруем поезда, которые отправляются позже текущего времени
    let filteredTrains = trains.filter(train => {
        if (!train.departure) return false; // Если нет времени отправления — пропускаем

        let [hours, minutes] = train.departure.split(':').map(Number);
        let trainTime = new Date();
        trainTime.setHours(hours, minutes, 0, 0);

        return trainTime >= now;
    });

    // Ограничиваем 15 поездами
    filteredTrains = filteredTrains.slice(0, 15);

    if (filteredTrains.length === 0) {
        trainTable.innerHTML = "<tr><td colspan='5'>Нет поездов</td></tr>";
        return;
    }

    // Заполняем таблицу
    filteredTrains.forEach(train => {
        let row = `
            <tr>
                <td>${train.thread ? train.thread.number : '—'}</td>
                <td>${train.thread ? train.thread.title : '—'}</td>
                <td>${train.arrival || '—'}</td>
                <td>${train.stops || '—'}</td>
                <td>${train.departure || '—'}</td>
            </tr>
        `;
        trainTable.innerHTML += row;
    });
}

// Функция для обновления расписания при смене города или даты
function updateSchedule() {
    let city = document.getElementById("citySelect").value;
    let date = document.getElementById("dateSelect").value || getCurrentDate();
    fetchTrainSchedule(city, date);
}

// Создание выпадающего списка городов
function populateCitySelect() {
    let citySelect = document.getElementById("citySelect");

    Object.keys(cityCodes).forEach(city => {
        let option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    citySelect.addEventListener("change", updateSchedule);
}

// Инициализация при загрузке страницы
window.onload = function () {
    populateCitySelect();
    updateSchedule();
};
