function _setLocalStorage(workouts) {
  const cleanWorkouts = workouts.map(workout => {
    const { marker, ...cleanedWorkout } = workout;
    return cleanedWorkout;
    //const { marker, ...cleanedWorkout } = workout;: Destructuring assignment pozwala na wyjęcie z obiektu workout właściwości marker i pozostałych właściwości,
    // które trafiają do obiektu cleanedWorkout. W rezultacie w obiekcie cleanedWorkout nie ma już właściwości marker.
  });

  localStorage.setItem('workouts', JSON.stringify(cleanWorkouts));
  // localStorage.setItem('workouts', JSON.stringify(this._workuts));
  //Problem prawdopodobnie wynika z faktu, że przed dodaniem usuwania elementów do treningów (this._workuts),
  //nie miały one zagnieżdżonych referencji do obiektów takich jak marker czy this.#map. W momencie dodawania funkcji usuwającej do zdarzenia 'popupclose',
  //dodajesz referencje do marker, które są zagnieżdżone w this.#map. To powoduje, że struktura danych staje się bardziej złożona i
  // może powodować błędy przy próbie serializacji.
}

export default _setLocalStorage;
