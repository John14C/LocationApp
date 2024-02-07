import _setLocalStorage from './setLocalStorage';
class MarkerView {
  _renderWorkoutMarker(workout, map, workouts) {
    workout.marker = L.marker(workout.coords)
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : ' 🚴‍♀️'} ${workout.description}`
      )
      .on('popupclose', () => {
        //żywa zdarzenia (eventu) 'popupclose', które jest wywoływane, gdy popup (dymek) na mapie zostanie zamknięty.
        const workoutEl = document.querySelector(
          //szukamy element z klasą workout, którego atrybut data-id ma wartość równej workout.id.
          `.workout[data-id="${workout.id}"]`
        );
        if (workoutEl) {
          //jeszeli istnaijee to go usuwamy
          workoutEl.remove();
          workouts = workouts.filter(
            work => work.id !== workout.id //aktualizacja listy treningów filtrujemy o ten jeden usuniety
          );
          // Aktualizuj localStorage po usunięciu treningu
          _setLocalStorage(workouts);
        }

        if (workout.marker) {
          map.removeLayer(workout.marker); //Usuwamy pineske
        }
      })
      .openPopup();
  }
}
export default new MarkerView();
