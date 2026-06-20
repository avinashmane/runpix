import defaultRaceImage from '../assets/race_images/default.png'
import MyChoiceRaceImage from '../assets/race_images/mychoice.png'

export function get_default_race_image(id) {

  if ((id instanceof String) && (id.slice(0, 8)== "mychoice"))
    return MyChoiceRaceImage
  else
    return defaultRaceImage
}