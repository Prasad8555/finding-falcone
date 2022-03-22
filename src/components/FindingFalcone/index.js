import {Component} from 'react'
import {TailSpin} from 'react-loader-spinner'
import {v4} from 'uuid'
import './index.css'

const initialState = {
  planets: [],
  vehicles: [],
  token: '',
  planetOne: '',
  planetTwo: '',
  planetThree: '',
  planetFour: '',
  vehicleOne: '',
  vehicleTwo: '',
  vehicleThree: '',
  vehicleFour: '',
  timeTaken: 0,
  requestStatus: 'LOADING',
  findResult: false,
  resultObject: '',
  error: '',
}

const requestStatusConstant = {
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class FindingFalcone extends Component {
  state = initialState

  componentDidMount = () => {
    this.getPlanetsVehiclesAndToken() // this function in 165 line
  }

  GetSearchResult = async () => {
    // this function gets result
    const {
      token,
      planetOne,
      planetTwo,
      planetThree,
      planetFour,
      vehicleOne,
      vehicleTwo,
      vehicleThree,
      vehicleFour,
    } = this.state
    const bodyObject = {
      token,
      planet_names: [planetOne, planetTwo, planetThree, planetFour],
      vehicle_names: [vehicleOne, vehicleTwo, vehicleThree, vehicleFour],
    }
    const url = 'https://findfalcone.herokuapp.com/find'
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObject),
    }
    const findFalconeRequestResponse = await fetch(url, options)

    if (findFalconeRequestResponse.ok === true) {
      const responseData = await findFalconeRequestResponse.json()
      const {status, error} = responseData
      if (status !== undefined) {
        const updatedData = {
          planetName: responseData.planet_name,
          status: responseData.status,
        }
        this.setState({
          resultObject: updatedData,
          requestStatus: 'SUCCESS',
        })
      } else {
        this.setState({
          error,
          requestStatus: 'SUCCESS',
        })
      }
    } else {
      this.setState({
        requestStatus: 'FAILURE',
      })
    }
  }

  getToken = async () => {
    // this function returns token
    const tokenUrl = 'https://findfalcone.herokuapp.com/token'
    const options = {
      headers: {
        Accept: 'application/json',
      },
      method: 'POST',
    }

    const tokenResponse = await fetch(tokenUrl, options)
    let token = ''
    if (tokenResponse.ok === true) {
      const tokenObject = await tokenResponse.json()
      token = tokenObject.token
    }
    return token
  }

  getUpdatedVehicles = vehicles => {
    // this function returns updated Vehicles Data
    const updatedVehicles = vehicles.map(eachVehicle => ({
      name: eachVehicle.name,
      totalNo: eachVehicle.total_no,
      maxDistance: eachVehicle.max_distance,
      speed: eachVehicle.speed,
    }))
    return updatedVehicles
  }

  getVehiclesData = async () => {
    // this function returns vehicles Data
    const vehiclesUrl = 'https://findfalcone.herokuapp.com/vehicles'
    const vehiclesResponse = await fetch(vehiclesUrl)
    let vehicles = []
    if (vehiclesResponse.ok === true) {
      const vehiclesData = await vehiclesResponse.json()
      vehicles = this.getUpdatedVehicles(vehiclesData)
    }
    return vehicles
  }

  getUpdatedPlanets = planets => {
    // this function returns updated planets
    const updatedPlanets = planets.map(eachPlanet => ({
      name: eachPlanet.name,
      distance: eachPlanet.distance,
      activeId: '',
    }))
    return updatedPlanets
  }

  getPlanetsData = async () => {
    // this function returns planets Data
    const planetsUrl = 'https://findfalcone.herokuapp.com/planets'
    const planetsResponse = await fetch(planetsUrl)
    let planets: []
    if (planetsResponse.ok === true) {
      const planetsData = await planetsResponse.json()
      planets = this.getUpdatedPlanets(planetsData)
    }
    return planets
  }

  getPlanetsVehiclesAndToken = async () => {
    // this function get planets, vehicles and token and updates in the state
    const planets = await this.getPlanetsData()
    const vehicles = await this.getVehiclesData()
    const token = await this.getToken()
    const allRequestsAreSuccess =
      planets !== [] && vehicles !== [] && token !== ''
    const requestStatus = allRequestsAreSuccess ? 'SUCCESS' : 'FAILURE'
    this.setState({
      planets,
      vehicles,
      token,
      requestStatus,
    })
  }

  getPlanetsVehiclesTokenAndSendFindRequest = () => {
    // this function calls the get planets vehicles and token data function and get result function
    this.setState({
      requestStatus: 'LOADING',
    })
    const {findResult} = this.state
    if (findResult === true) {
      this.GetSearchResult() // this function in 39 line
    } else {
      this.getPlanetsAndVehiclesData() // this function in 151 line
    }
  }

  onClickReset = () => {
    // this function resets all the data in state
    this.setState(initialState, this.getPlanetsAndVehiclesAndTokenAlsoFind)
  }

  onClickStartAgain = () => {
    // this function resets all the data in state
    this.setState(initialState, this.getPlanetsAndVehiclesAndTokenAlsoFind)
  }

  onClickFindButton = event => {
    // this function changes the find result value in state
    event.preventDefault()
    this.setState(
      {
        findResult: true,
      },
      this.getPlanetsAndVehiclesAndTokenAlsoFind,
    )
  }

  onChangeVehicleFour = event => {
    // this function manage the changes in vehicle four value
    const {planets, planetFour, timeTaken, vehicles, vehicleFour} = this.state
    const argumentVehicleName = event.target.value
    const [planetFourData] = planets.filter(
      eachPlanet => eachPlanet.name === planetFour,
    )
    const {distance} = planetFourData
    const [argumentVehicleData] = vehicles.filter(
      eachVehicle => eachVehicle.name === argumentVehicleName,
    )
    const [vehicleFourData] = vehicles.filter(
      eachVehicle => eachVehicle.name === vehicleFour,
    )
    let updatedTimeTaken = timeTaken
    if (vehicleFourData === undefined) {
      const argumentVehicleSpeed = argumentVehicleData.speed
      updatedTimeTaken += Math.round(distance / argumentVehicleSpeed)
    } else {
      const argumentVehicleSpeed = argumentVehicleData.speed
      const vehicleFourSpeed = vehicleFourData.speed
      const vehicleFourTakenTime = Math.round(distance / vehicleFourSpeed)
      const argumentVehicleTakenTime = Math.round(
        distance / argumentVehicleSpeed,
      )
      updatedTimeTaken -= vehicleFourTakenTime
      updatedTimeTaken += argumentVehicleTakenTime
    }
    const updatedVehicles = vehicles.map(eachVehicle => {
      const vehicleName = eachVehicle.name
      const {totalNo} = eachVehicle
      if (vehicleName === argumentVehicleName) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: totalNo - 1,
        }
        return updatedVehicle
      }
      if (vehicleName === vehicleFour) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: eachVehicle.totalNo + 1,
        }
        return updatedVehicle
      }
      return eachVehicle
    })
    this.setState({
      vehicles: updatedVehicles,
      vehicleFour: argumentVehicleName,
      timeTaken: updatedTimeTaken,
    })
  }

  onChangePlanetFour = event => {
    // this function manages the changes in planet four
    const planet = event.target.value
    const {planets, planetFour} = this.state
    const prevPlanet = planetFour
    if (prevPlanet !== '') {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === prevPlanet) {
          const updatedPreviousPlanet = {
            ...eachPlanet,
            activeId: '',
          }
          return updatedPreviousPlanet
        }
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet4',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetFour: planet,
      })
    } else {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet4',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetFour: planet,
      })
    }
  }

  onChangeVehicleThree = event => {
    // this function manages the changes in vehicle three value
    const {planets, planetThree, timeTaken, vehicles, vehicleThree} = this.state
    const argumentVehicleName = event.target.value
    const [planetThreeData] = planets.filter(
      eachPlanet => eachPlanet.name === planetThree,
    )
    const {distance} = planetThreeData
    const [argumentVehicleData] = vehicles.filter(
      eachVehicle => eachVehicle.name === argumentVehicleName,
    )
    const [vehicleThreeData] = vehicles.filter(
      eachVehicle => eachVehicle.name === vehicleThree,
    )
    let updatedTimeTaken = timeTaken
    if (vehicleThreeData === undefined) {
      const argumentVehicleSpeed = argumentVehicleData.speed
      updatedTimeTaken += Math.round(distance / argumentVehicleSpeed)
    } else {
      const argumentVehicleSpeed = argumentVehicleData.speed
      const vehicleThreeSpeed = vehicleThreeData.speed
      const vehicleThreeTakenTime = Math.round(distance / vehicleThreeSpeed)
      const argumentVehicleTakenTime = Math.round(
        distance / argumentVehicleSpeed,
      )
      updatedTimeTaken -= vehicleThreeTakenTime
      updatedTimeTaken += argumentVehicleTakenTime
    }
    const updatedVehicles = vehicles.map(eachVehicle => {
      const vehicleName = eachVehicle.name
      const {totalNo} = eachVehicle
      if (vehicleName === argumentVehicleName) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: totalNo - 1,
        }
        return updatedVehicle
      }
      if (vehicleName === vehicleThree) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: eachVehicle.totalNo + 1,
        }
        return updatedVehicle
      }
      return eachVehicle
    })
    this.setState({
      vehicles: updatedVehicles,
      vehicleThree: argumentVehicleName,
      timeTaken: updatedTimeTaken,
    })
  }

  onChangePlanetThree = event => {
    // this function  manages the changes in planet three
    const planet = event.target.value
    const {planets, planetThree} = this.state
    const prevPlanet = planetThree
    if (prevPlanet !== '') {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === prevPlanet) {
          const updatedPreviousPlanet = {
            ...eachPlanet,
            activeId: '',
          }
          return updatedPreviousPlanet
        }
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet3',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetThree: planet,
      })
    } else {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet3',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetThree: planet,
      })
    }
  }

  onChangeVehicleTwo = event => {
    // this function manages the changes in vehicle two
    const {planets, planetTwo, timeTaken, vehicles, vehicleTwo} = this.state
    const argumentVehicleName = event.target.value
    const [planetTwoData] = planets.filter(
      eachPlanet => eachPlanet.name === planetTwo,
    )
    const {distance} = planetTwoData
    const [argumentVehicleData] = vehicles.filter(
      eachVehicle => eachVehicle.name === argumentVehicleName,
    )
    const [vehicleTwoData] = vehicles.filter(
      eachVehicle => eachVehicle.name === vehicleTwo,
    )
    let updatedTimeTaken = timeTaken
    if (vehicleTwoData === undefined) {
      const argumentVehicleSpeed = argumentVehicleData.speed
      updatedTimeTaken += Math.round(distance / argumentVehicleSpeed)
    } else {
      const argumentVehicleSpeed = argumentVehicleData.speed
      const vehicleTwoSpeed = vehicleTwoData.speed
      const vehicleTwoTakenTime = Math.round(distance / vehicleTwoSpeed)
      const argumentVehicleTakenTime = Math.round(
        distance / argumentVehicleSpeed,
      )
      updatedTimeTaken -= vehicleTwoTakenTime
      updatedTimeTaken += argumentVehicleTakenTime
    }
    const updatedVehicles = vehicles.map(eachVehicle => {
      const vehicleName = eachVehicle.name
      const {totalNo} = eachVehicle
      if (vehicleName === argumentVehicleName) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: totalNo - 1,
        }
        return updatedVehicle
      }
      if (vehicleName === vehicleTwo) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: eachVehicle.totalNo + 1,
        }
        return updatedVehicle
      }
      return eachVehicle
    })
    this.setState({
      vehicles: updatedVehicles,
      vehicleTwo: argumentVehicleName,
      timeTaken: updatedTimeTaken,
    })
  }

  onChangePlanetTwo = event => {
    // this function manages the changes in planet two value
    const planet = event.target.value
    const {planets, planetTwo} = this.state
    const prevPlanet = planetTwo
    if (prevPlanet !== '') {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === prevPlanet) {
          const updatedPreviousPlanet = {
            ...eachPlanet,
            activeId: '',
          }
          return updatedPreviousPlanet
        }
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet2',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetTwo: planet,
      })
    } else {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet2',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetTwo: planet,
      })
    }
  }

  onChangeVehicleOne = event => {
    // this function manages the changes in vehicle one value
    const {planets, planetOne, vehicles, vehicleOne, timeTaken} = this.state
    const argumentVehicleName = event.target.value
    const [planetOneData] = planets.filter(
      eachPlanet => eachPlanet.name === planetOne,
    )
    const {distance} = planetOneData
    const [argumentVehicleData] = vehicles.filter(
      eachVehicle => eachVehicle.name === argumentVehicleName,
    )
    const [vehicleOneData] = vehicles.filter(
      eachVehicle => eachVehicle.name === vehicleOne,
    )
    let updatedTimeTaken = timeTaken
    if (vehicleOneData === undefined) {
      const argumentVehicleSpeed = argumentVehicleData.speed
      updatedTimeTaken += Math.round(distance / argumentVehicleSpeed)
    } else {
      const argumentVehicleSpeed = argumentVehicleData.speed
      const vehicleOneSpeed = vehicleOneData.speed
      const vehicleOneTakenTime = Math.round(distance / vehicleOneSpeed)
      const argumentVehicleTakenTime = Math.round(
        distance / argumentVehicleSpeed,
      )
      updatedTimeTaken -= vehicleOneTakenTime
      updatedTimeTaken += argumentVehicleTakenTime
    }

    const updatedVehicles = vehicles.map(eachVehicle => {
      const vehicleName = eachVehicle.name
      const {totalNo} = eachVehicle
      if (vehicleName === argumentVehicleName) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: totalNo - 1,
        }
        return updatedVehicle
      }
      if (vehicleName === vehicleOne) {
        const updatedVehicle = {
          ...eachVehicle,
          totalNo: eachVehicle.totalNo + 1,
        }
        return updatedVehicle
      }
      return eachVehicle
    })
    this.setState({
      vehicles: updatedVehicles,
      vehicleOne: argumentVehicleName,
      timeTaken: updatedTimeTaken,
    })
  }

  onChangePlanetOne = event => {
    // this function manages the changes in planet one
    const planet = event.target.value
    const {planets, planetOne} = this.state
    const prevPlanet = planetOne
    if (prevPlanet !== '') {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === prevPlanet) {
          const updatedPreviousPlanet = {
            ...eachPlanet,
            activeId: '',
          }
          return updatedPreviousPlanet
        }
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet1',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetOne: planet,
      })
    } else {
      const updatedPlanets = planets.map(eachPlanet => {
        const planetName = eachPlanet.name
        if (planetName === planet) {
          const updatedPresentPlanet = {
            ...eachPlanet,
            activeId: 'planet1',
          }
          return updatedPresentPlanet
        }
        return eachPlanet
      })
      this.setState({
        planets: updatedPlanets,
        planetOne: planet,
      })
    }
  }

  getPlanetData = planetName => {
    // this function returns the specific planet data
    const {planets} = this.state
    const planetData = planets.filter(
      eachPlanet => eachPlanet.name === planetName,
    )
    const [planet] = planetData
    return planet
  }

  failureView = () => (
    <div className="failure-view-container">
      <img
        src="https://res.cloudinary.com/aguruprasad/image/upload/v1647929099/something-was-wrong_u2hl6o.jpg"
        alt="some thing was wrong"
        className="failure-image"
      />
      <h1 className="failure-text">Oops! Some thing was Wrong.</h1>
    </div>
  )

  successView = () => {
    // success view
    const {
      planets,
      vehicles,
      planetOne,
      planetTwo,
      planetThree,
      planetFour,
      vehicleOne,
      vehicleTwo,
      vehicleThree,
      vehicleFour,
      timeTaken,
      resultObject,
      error,
    } = this.state
    const planetsAndVehiclesSelected =
      planetOne !== '' &&
      planetTwo !== '' &&
      planetThree !== '' &&
      planetFour !== '' &&
      vehicleOne !== '' &&
      vehicleTwo !== '' &&
      vehicleThree !== '' &&
      vehicleFour !== ''
    const planetOneData = planetOne !== '' && this.getPlanetData(planetOne)
    const planetTwoData = planetTwo !== '' && this.getPlanetData(planetTwo)
    const planetThreeData =
      planetThree !== '' && this.getPlanetData(planetThree)
    const planetFourData = planetFour !== '' && this.getPlanetData(planetFour)

    return (
      <>
        {resultObject === '' ? (
          <form className="user-planets-vehicles-form">
            <p className="description">Select planets you want to search in:</p>
            <div className="planets-vehicles-background-container">
              <div className="planet-vehicle-container">
                <label
                  htmlFor="destinationOne"
                  className="planets-selector-label"
                >
                  Destination 1
                </label>
                <select
                  id="destinationOne"
                  value={planetOne}
                  onChange={this.onChangePlanetOne}
                  className="planet-selector"
                >
                  <option disabled className="select-option" value="">
                    Select
                  </option>
                  {planets.map(
                    eachPlanet =>
                      (eachPlanet.activeId === '' ||
                        eachPlanet.activeId === 'planet1') && (
                        <option key={v4()}>{eachPlanet.name}</option>
                      ),
                  )}
                </select>
                {planetOne !== '' && (
                  <ul className="vehicles-list">
                    {vehicles.map(eachVehicle => {
                      const vehicleName = eachVehicle.name
                      const distance = eachVehicle.maxDistance
                      const vehicleIndex = vehicles.indexOf(eachVehicle)
                      const id = `vehicle${vehicleIndex}`
                      const vehicleCount = eachVehicle.totalNo
                      const vehicleContent = `${vehicleName} (${vehicleCount})`
                      if (
                        (eachVehicle.totalNo > 0 &&
                          planetOneData.distance <= distance) ||
                        vehicleName === vehicleOne
                      ) {
                        return (
                          <li key={id} className="vehicle-list-item">
                            <input
                              type="radio"
                              id={id}
                              name="planet1"
                              value={vehicleName}
                              onChange={this.onChangeVehicleOne}
                            />
                            <label htmlFor={id}>{vehicleContent}</label>
                          </li>
                        )
                      }
                      return (
                        <li key={id} className="vehicle-list-item">
                          <input type="radio" name="planet1" id={id} disabled />
                          <label
                            htmlFor={id}
                            className="disabled-vehicle-label"
                          >
                            {vehicleContent}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <div className="planet-vehicle-container">
                <label
                  htmlFor="destinationTwo"
                  className="planets-selector-label"
                >
                  Destination 2
                </label>
                <select
                  id="destinationTwo"
                  value={planetTwo}
                  onChange={this.onChangePlanetTwo}
                  className="planet-selector"
                >
                  <option disabled className="select-option" value="">
                    Select
                  </option>
                  {planets.map(
                    eachPlanet =>
                      (eachPlanet.activeId === '' ||
                        eachPlanet.activeId === 'planet2') && (
                        <option key={v4()}>{eachPlanet.name}</option>
                      ),
                  )}
                </select>
                {planetTwo !== '' && (
                  <ul className="vehicles-list">
                    {vehicles.map(eachVehicle => {
                      const vehicleName = eachVehicle.name
                      const distance = eachVehicle.maxDistance
                      const vehicleIndex = vehicles.indexOf(eachVehicle)
                      const id = `vehicle${vehicleIndex + 10}`
                      const vehicleCount = eachVehicle.totalNo
                      const vehicleContent = `${vehicleName} (${vehicleCount})`
                      if (
                        (eachVehicle.totalNo > 0 &&
                          planetTwoData.distance <= distance) ||
                        vehicleName === vehicleTwo
                      ) {
                        return (
                          <li key={id} className="vehicle-list-item">
                            <input
                              type="radio"
                              id={id}
                              name="planet2"
                              value={vehicleName}
                              onChange={this.onChangeVehicleTwo}
                            />
                            <label htmlFor={id}>{vehicleContent}</label>
                          </li>
                        )
                      }
                      return (
                        <li key={id} className="vehicle-list-item">
                          <input type="radio" name="planet2" id={id} disabled />
                          <label
                            htmlFor={id}
                            className="disabled-vehicle-label"
                          >
                            {vehicleContent}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <div className="planet-vehicle-container">
                <label
                  htmlFor="destinationThree"
                  className="planets-selector-label"
                >
                  Destination 3
                </label>
                <select
                  id="destinationThree"
                  value={planetThree}
                  onChange={this.onChangePlanetThree}
                  className="planet-selector"
                >
                  <option disabled className="select-option" value="">
                    Select
                  </option>
                  {planets.map(
                    eachPlanet =>
                      (eachPlanet.activeId === '' ||
                        eachPlanet.activeId === 'planet3') && (
                        <option key={v4()}>{eachPlanet.name}</option>
                      ),
                  )}
                </select>
                {planetThree !== '' && (
                  <ul className="vehicles-list">
                    {vehicles.map(eachVehicle => {
                      const vehicleName = eachVehicle.name
                      const distance = eachVehicle.maxDistance
                      const vehicleIndex = vehicles.indexOf(eachVehicle)
                      const id = `vehicle${vehicleIndex + 20}`
                      const vehicleCount = eachVehicle.totalNo
                      const vehicleContent = `${vehicleName} (${vehicleCount})`
                      if (
                        (eachVehicle.totalNo > 0 &&
                          planetThreeData.distance <= distance) ||
                        vehicleName === vehicleThree
                      ) {
                        return (
                          <li key={id} className="vehicle-list-item">
                            <input
                              type="radio"
                              id={id}
                              name="planet3"
                              value={vehicleName}
                              onChange={this.onChangeVehicleThree}
                            />
                            <label htmlFor={id}>{vehicleContent}</label>
                          </li>
                        )
                      }
                      return (
                        <li key={id} className="vehicle-list-item">
                          <input type="radio" name="planet3" id={id} disabled />
                          <label
                            htmlFor={id}
                            className="disabled-vehicle-label"
                          >
                            {vehicleContent}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <div className="planet-vehicle-container">
                <label
                  htmlFor="destinationFour"
                  className="planets-selector-label"
                >
                  Destination 4
                </label>
                <select
                  id="destinationFour"
                  value={planetFour}
                  onChange={this.onChangePlanetFour}
                  className="planet-selector"
                >
                  <option disabled className="select-option" value="">
                    Select
                  </option>
                  {planets.map(
                    eachPlanet =>
                      (eachPlanet.activeId === '' ||
                        eachPlanet.activeId === 'planet4') && (
                        <option key={v4()}>{eachPlanet.name}</option>
                      ),
                  )}
                </select>
                {planetFour !== '' && (
                  <ul className="vehicles-list">
                    {vehicles.map(eachVehicle => {
                      const vehicleName = eachVehicle.name
                      const distance = eachVehicle.maxDistance
                      const vehicleIndex = vehicles.indexOf(eachVehicle)
                      const id = `vehicle${vehicleIndex + 30}`
                      const vehicleCount = eachVehicle.totalNo
                      const vehicleContent = `${vehicleName} (${vehicleCount})`
                      if (
                        (eachVehicle.totalNo > 0 &&
                          planetFourData.distance <= distance) ||
                        vehicleName === vehicleFour
                      ) {
                        return (
                          <li key={id} className="vehicle-list-item">
                            <input
                              type="radio"
                              id={id}
                              name="planet4"
                              value={vehicleName}
                              onChange={this.onChangeVehicleFour}
                            />
                            <label htmlFor={id}>{vehicleContent}</label>
                          </li>
                        )
                      }
                      return (
                        <li key={id} className="vehicle-list-item">
                          <input type="radio" name="planet4" id={id} disabled />
                          <label
                            htmlFor={id}
                            className="disabled-vehicle-label"
                          >
                            {vehicleContent}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <div>
                <h1 className="time-taken">
                  Time taken: <span className="time">{timeTaken}</span>
                </h1>
              </div>
            </div>
            {planetsAndVehiclesSelected ? (
              <button
                className="find-falcone-button"
                type="button"
                onClick={this.onClickFindButton}
              >
                Find Falcone!
              </button>
            ) : (
              <button
                type="button"
                className="disabled-button find-falcone-button"
              >
                Find Falcone!
              </button>
            )}
          </form>
        ) : (
          <div className="result-container">
            <p>
              {resultObject.status === 'success' &&
                'Success! Congratulations on Finding Falcone. King Shan is mighty pleased.'}
            </p>
            <p>
              {resultObject.status === 'false' &&
                'Failure! You Failed on Finding Falcone. King Shan is not pleased.'}
            </p>
            <p>
              {resultObject.status === 'success' && `Time taken: ${timeTaken}`}
            </p>
            <p>
              {resultObject.status === 'success' &&
                `Planet found: ${resultObject.planetName}`}
            </p>
            <h1>{error !== '' && `${error}`}</h1>
            <button
              type="button"
              className="start-again-button"
              onClick={this.onClickStartAgain}
            >
              Start Again
            </button>
          </div>
        )}
      </>
    )
  }

  loadingView = () => (
    // loading view
    <div className="loading-container">
      <TailSpin className="loader" height={50} width={50} color="#ffff" />
    </div>
  )

  renderContent = () => {
    const {requestStatus} = this.state
    switch (requestStatus) {
      case requestStatusConstant.loading:
        return this.loadingView()
      case requestStatusConstant.success:
        return this.successView()
      case requestStatusConstant.failure:
        return this.failureView()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="finding-falcone-app">
        <nav className="nav-container">
          <div className="nav-buttons-container">
            <button
              className="nav-button"
              type="button"
              onClick={this.onClickReset}
            >
              Reset
            </button>
            <button className="nav-button" type="button">
              GeekTrust Home
            </button>
          </div>
          <h1 className="heading">Finding Falcone</h1>
        </nav>
        <div>{this.renderContent()}</div>
      </div>
    )
  }
}

export default FindingFalcone
