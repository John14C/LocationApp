import markerView from './markerView';
import workoutView from './workoutView';
import WorkoutModule from './workout';
import _setLocalStorage from './setLocalStorage';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  _map;
  #mapZoomLevel = 13;
  #mapEvent;
  _workuts = [];
  constructor() {
    //Wywoływane zawsze przy ładowaniu strony
    this._getPosition(); //Pobiera naszą pozycje

    //Pobieramy dane z LocalStorage
    this._getLocalStorage();

    form.addEventListener('submit', this._newWorkout.bind(this)); //Po wypełnienu okna mmożemy kliknąc enter po czym  wyświetli nam na mapie pineske

    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        //Pobiera pozycje i wywołuje metode loadMap
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position ');
        }
      );
  }
  ////////////////////////
  _loadMap(position) {
    //Wyświetlna mape w naszej lokalizacji
    const { latitude } = position.coords; //latitude = position.coords.latitude
    const { longitude } = position.coords;
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude]; //w takiej postaci [50.12355, 22.420744]

    this._map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    this._map.on('click', this._showForm.bind(this)); //Jak klikniemy na mape to wywoła showform

    this._workuts.forEach(work => {
      markerView._renderWorkoutMarker(work, this._map, this._workuts);
    });
  }
  //////////////////////
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden'); //Która nam wyświetli okno do uzupełniania trenignu
    inputDistance.focus();
  }
  /////////////////////
  _hideForm() {
    //Empty inputs
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  /////////////////////
  _toggleElevationField() {
    //Zawsze gdy zmienimy forme aktywności z biegania na rower to zmieni sie candence na drugie po przez dodawanie calsy hidden zawsze do jednego
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  /////////////////////
  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp)); //(...input arr) //jeżeli wszytskie elemnety tablicy input są liczbami every zwóci true
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();
    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; //+ string to number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if workout running. create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Input have to be positive number'); //Jeśli dystans nie jest liczbą return
      workout = new WorkoutModule.Running(
        [lat, lng],
        distance,
        duration,
        cadence
      );
    }

    //if worout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration) //elevation może być ujemne, dlatego nie ma tego tu
      )
        return alert('Input have to be positive number'); //Jeśli dystans nie jest liczbą return
      workout = new WorkoutModule.Cycling(
        [lat, lng],
        distance,
        duration,
        elevation
      );
    }
    //add new object to workout array
    this._workuts.push(workout);
    //Render workout on map as marker
    markerView._renderWorkoutMarker(workout, this._map, this._workuts);
    //Render workout on list
    workoutView._renderWorkout(workout, form);
    //hide form + Clear input fields
    this._hideForm();
    //Set local storage to all workouts
    _setLocalStorage(this._workuts);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout'); //Po naciśnięciu czegoś co jest niżej w hiereachi cals niz workout(html) dostaniemy jego dane
    if (!workoutEl) return;
    const workout = this._workuts.find(
      work => work.id === workoutEl.dataset.id
    );

    this._map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1, //dokumnetacja leaflet
      },
    });
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;
    this._workuts = data; //wrzucamy dane z bazy do naszej tablicy treningow i dla każdego tworzymy tabliczke
    this._workuts.forEach(work => {
      workoutView._renderWorkout(work, form);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
export default new App(); //Inicjalizacja classy App
