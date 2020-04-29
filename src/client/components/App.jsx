import './App.scss'

import React, { useEffect, useReducer } from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { useSubstate } from 'react-substate'

import Api from '~/client/modules/Api'
import DeviceDb from '~/client/modules/DeviceDb'
import { Substates } from '~/client/modules/Substates'

import BottomBar from './App/BottomBar/BottomBar'
import TopBar from './App/TopBar/TopBar'
import Devices from './devices/Devices'

const Routes = () => {
    return (
        <Switch>
            <Route path='/devices' component={Devices} />

            <Redirect to='/devices' />
        </Switch>
    )
}

const App = () => {
    // create reducer for DeviceDb.Context
    const [deviceDb, dispatch] = useReducer(DeviceDb.reducer, [])

    const [pageTitle] = useSubstate(Substates.pageTitle)

    DeviceDb.setDispatch(dispatch)

    // Set up the websocket. When opened, this will load the initial data
    useEffect(() => {
        Api.openWebsocket({
            onOpen: () => {
                // Retrieve new states and devices from the API
                Api.refreshStates().then(() => {
                    // Put latest data into the device db
                    DeviceDb.actions.setDevices(Api.getDevices())
                })
            },
            onEvent: (eventData) => {
                DeviceDb.actions.setDeviceState(eventData)
            }
        })
    }, [])

    // Update the page title as-needed
    useEffect(() => {
        document.title = pageTitle
    }, [pageTitle])

    return (
        <BrowserRouter>
            <DeviceDb.Context.Provider value={deviceDb}>
                <TopBar />
                <Routes />
                <BottomBar />
            </DeviceDb.Context.Provider>
        </BrowserRouter>
    )
}

export default App