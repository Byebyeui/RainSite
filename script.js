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

// Фиксированное расписание поездов (по 15 поездов в каждом городе)
const fixedSchedule = [];

function generateFixedSchedule() {
    let trainNumber = 1000;

    cities.forEach(city => {
        for (let i = 0; i < 15; i++) {
            let startTime = new Date();
            startTime.setHours(Math.floor(i * 24 / 15), Math.floor(Math.random() * 60), 0, 0); // Равномерно по дню

            let routeCities = getRoute(city);
            let schedule = {};

            let travelTime = 0;
            routeCities.forEach((stopCity, index) => {
                if (index === 0) {
                    schedule[stopCity] = formatTime(startTime);
                } else {
                    travelTime += Math.floor(Math.random() * 90) + 30; // Поездка от 30 до 120 минут
                    let arrivalTime = new Date(startTime.getTime() + travelTime * 60000);
                    schedule[stopCity] = formatTime(arrivalTime);
                }
            });

            let train = {
                номер: trainNumber++,
                маршрут: `${routeCities[0]} - ${routeCities[routeCities.length - 1]}`,
                остановки: schedule,
                стоянка: Math.floor(Math.random() * 8) + 3 // Стоянка от 3 до 10 минут
            };

            fixedSchedule.push(train);
        }
    });
}

// Генерирует маршрут для поезда (от 2 до 5 городов)
function getRoute(startCity) {
    let route = [startCity];
    let availableCities = cities.filter(city => city !== startCity);
    let stops = Math.floor(Math.random() * 3) + 2; // От 2 до 5 городов в маршруте

    for (let i = 0; i < stops; i++) {
        let nextCity = availableCities.splice(Math.floor(Math.random() * availableCities.length), 1)[0];
        route.push(nextCity);
    }

    return route;
}

// Форматирует время (ЧЧ:ММ)
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// Фильтрация поездов: показываем только те, что ещё не прибыли в выбранный город
function getRelevantTrains(city) {
    let now = new Date();
    let trains = [];

    fixedSchedule.forEach(train => {
        if (train.остановки[city]) {
            let [hours, minutes] = train.остановки[city].split(':').map(Number);
            let trainTime = new Date();
            trainTime.setHours(hours, minutes, 0, 0);

            if (trainTime >= now) { // Только будущие поезда
                trains.push({
                    номер: train.номер,
                    маршрут: train.маршрут,
                    прибытие: train.остановки[city],
                    стоянка: train.стоянка,
                    отправление: calculateDepartureTime(train.остановки[city], train.стоянка)
                });
            }
        }
    });

    // Сортируем поезда по времени прибытия (от ближайшего)
    trains.sort((a, b) => {
        let timeA = a.прибытие.split(':').map(Number);
        let timeB = b.прибытие.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    return trains;
}

// Функция для расчёта времени отправления
function calculateDepartureTime(arrivalTime, stopDuration) {
    let [hours, minutes] = arrivalTime.split(':').map(Number);
    let departureMinutes = minutes + stopDuration;

    if (departureMinutes >= 60) {
        hours += Math.floor(departureMinutes / 60);
        departureMinutes %= 60;
    }

    return `${hours.toString().padStart(2, "0")}:${departureMinutes.toString().padStart(2, "0")}`;
}

// Обновление таблицы
function updateTable(city) {
    let trainTable = document.getElementById("trainTable");
    trainTable.innerHTML = ""; // Очищаем таблицу

    let trains = getRelevantTrains(city).slice(0, 15); // Ограничиваем 15 ближайшими поездами

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
