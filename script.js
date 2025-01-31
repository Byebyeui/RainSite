// Получаем текущую дату в формате YYYY-MM-DD
function getCurrentDate() {
    let now = new Date();
    return now.toISOString().split('T')[0]; // Пример: "2025-01-31"
}

// Города
const cities = [
    "Минск", "Орша", "Молодечно", "Борисов", "Барановичи", "Гродно", "Лида", "Лунинец",
    "Брест", "Пинск", "Гомель", "Калинковичи", "Жлобин", "Могилев", "Кричев", "Осиповичи",
    "Бобруйск", "Витебск", "Полоцк"
];

// Фиксированное расписание поездов (не более 15 поездов на город в сутки)
const fixedSchedule = {};

// Генерируем расписание (один раз)
function generateFixedSchedule() {
    cities.forEach(city => {
        fixedSchedule[city] = [];
        let startTime = new Date();
        startTime.setHours(0, 0, 0, 0); // Начинаем с 00:00

        for (let i = 0; i < 19; i++) { // 15 поездов в сутки
            let arrival = new Date(startTime);
            arrival.setMinutes(arrival.getMinutes() + Math.floor(Math.random() * 60) + 30); // Интервал 30-90 мин

            let departure = new Date(arrival);
            departure.setMinutes(departure.getMinutes() + Math.floor(Math.random() * 10) + 3); // Стоянка 3-12 мин

            let fromCity = getRandomCity();
            let toCity = getRandomCity(fromCity);
            let route = `${fromCity} - ${toCity}`;

            let train = {
                номер: Math.floor(1000 + Math.random() * 9000), // Случайный номер поезда
                маршрут: route,
                прибытие: formatTime(arrival),
                стоянка: (departure - arrival) / 60000, // Длительность стоянки (в минутах)
                отправление: formatTime(departure)
            };

            fixedSchedule[city].push(train);
            startTime = new Date(departure); // Следующий поезд после отправления
        }
    });
}

// Функция для получения случайного города (кроме переданного)
function getRandomCity(exclude = "") {
    let filteredCities = cities.filter(city => city !== exclude);
    return filteredCities[Math.floor(Math.random() * filteredCities.length)];
}

// Форматируем время (ЧЧ:ММ)
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// Фильтруем только актуальные поезда на сегодня
function getRelevantTrains(city) {
    let now = new Date();
    let schedule = fixedSchedule[city] || [];

    return schedule.filter(train => {
        let [hours, minutes] = train.прибытие.split(':').map(Number);
        let trainTime = new Date();
        trainTime.setHours(hours, minutes, 0, 0);
        return trainTime >= now; // Только поезда, которые ещё не прибыли
    }).slice(0, 15); // Максимум 15 поездов в таблице
}

// Обновление таблицы
function updateTable(city) {
    let trainTable = document.getElementById("trainTable");
    trainTable.innerHTML = ""; // Очищаем таблицу

    let trains = getRelevantTrains(city);

    if (trains.length === 0) {
        trainTable.innerHTML = `<tr><td colspan="5">Нет предстоящих поездов</td></tr>`;
        return;
    }

    trains.forEach(train => {
        let row = `
            <tr>
                <td>${train.номер}</td>
                <td>${train.маршрут}</td>
                <td>${train.прибытие}</td>
                <td>${train.стоянка}</td>
                <td>${train.отправление}</td>
            </tr>
        `;
        trainTable.innerHTML += row;
    });
}

// Обновление даты в заголовке
function updateDate() {
    let now = new Date();
    let daysOfWeek = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    let formattedDate = `${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()} ${daysOfWeek[now.getDay()]}`;
    document.getElementById("currentDate").textContent = formattedDate;
}

// Создание выпадающего списка городов
function populateCitySelect() {
    let citySelect = document.getElementById("citySelect");

    cities.forEach(city => {
        let option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    citySelect.addEventListener("change", function() {
        updateTable(this.value);
    });

    updateTable(citySelect.value); // Загружаем расписание для первого города
}

// Запускаем генерацию и обновление при загрузке страницы
generateFixedSchedule();
updateDate();
populateCitySelect();
