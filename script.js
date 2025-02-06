const apiKey = 'd1cfa09d-ef66-4548-a6e6-34e759ab0c84'; // Вставь свой API ключ
const proxyUrl = 'https://api.allorigins.win/raw?url='; // Новый прокси сервер

let cityCodes = {}; // Маппинг города -> код

// Функция для получения кодов станций Яндекса
async function fetchCityCodes() {
    try {
        const url = `${proxyUrl}https://api.rasp.yandex.net/v3.0/stations/?apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        // Создаем маппинг города -> код
        if (data && data.stations) {
            cityCodes = data.stations.reduce((acc, station) => {
                acc[station.title] = station.code;
                return acc;
            }, {});

            // Заполняем выпадающий список
            populateCitySelect();
        } else {
            console.error('Ошибка при получении данных станций.');
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных о станциях:', error);
    }
}

// Функция для получения расписания поездов
async function fetchTrainSchedule(cityCode, date) {
    try {
        const url = `${proxyUrl}https://api.rasp.yandex.net/v3.0/schedule/?apikey=${apiKey}&station=${cityCode}&transport_type=train&date=${date}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.schedule) {
            displayTrainSchedule(data.schedule);
        } else {
            console.error('Ошибка при получении данных о расписании.');
        }
    } catch (error) {
        console.error('Ошибка при загрузке расписания:', error);
    }
}

// Функция для отображения расписания на странице
function displayTrainSchedule(schedule) {
    const trainTable = document.getElementById("trainTable");
    trainTable.innerHTML = ''; // Очищаем таблицу перед добавлением новых данных

    schedule.forEach(train => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${train.train.name}</td>
            <td>${train.station_from.title} - ${train.station_to.title}</td>
            <td>${train.departure}</td>
            <td>${train.arrival}</td>
            <td>${train.duration}</td>
        `;
        trainTable.appendChild(row);
    });
}

// Функция для заполнения выпадающего списка городов
function populateCitySelect() {
    const citySelect = document.getElementById('citySelect');
    citySelect.innerHTML = ''; // Очищаем выпадающий список перед добавлением новых данных

    for (const city in cityCodes) {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    }

    // Добавляем обработчик для изменения города
    citySelect.addEventListener('change', function() {
        const cityCode = cityCodes[this.value]; // Получаем код города
        const selectedDate = document.getElementById('dateSelect').value; // Получаем выбранную дату
        fetchTrainSchedule(cityCode, selectedDate); // Загружаем расписание для выбранного города и даты
    });

    // Загружаем расписание для первого города при инициализации
    const firstCityCode = cityCodes[Object.keys(cityCodes)[0]];
    const selectedDate = document.getElementById('dateSelect').value;
    fetchTrainSchedule(firstCityCode, selectedDate);
}

// Инициализация при загрузке страницы
window.onload = function() {
    fetchCityCodes(); // Получаем список станций
};
