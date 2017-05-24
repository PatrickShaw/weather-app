# Sequence Diagram README
We have provided a few interaction diagrams show casing what goes on for a few selected use cases to help develop a general fell of how our system works.

For sequence diagrams we have shown the normal flow for each use case.

Images of the sequence diagram can be found in `./images`, pdf versions can be found in `./pdf`

## Notes:
The software used to draw the sequence diagram did not render lifeline bars.

For readability as this tries to convey what is going on, we have left out object instantiation and simplify parts of the code in the digram.

Followed [IBM's UML Sequence Diagram Guidelines](https://www.ibm.com/developerworks/rational/library/3101.html).

Solid arrowhead (if a synchronous call operation) or with a stick arrowhead (if an asynchronous signal). 

## Use cases:

### Use case: ServerStart
An admin starts the backend server running `npm run backend-start`.

We show this as a use case as it gives a good high level over view of the entire system including the loop to get weather data every `weatherPollingInterval` seconds.

<img src="/UML/Sequence_Diagrams/images/ServerStart.png" >

### Use case: GetWeatherDataOnInterval

Get weather data for all monitored locations at `weatherPollingInterval` intervals.
<img src="/UML/Sequence_Diagrams/images/GetWeatherDataOnInterval.png" >

### Use case: AddRainfallMonitor
User clicks on the rain button to add a monitor for a location.

**Frontend - Button gets clicked, sends message to backend.**

<img src="/UML/Sequence_Diagrams/images/AddRainFallMonitor_Start_Frontend.png" >

**Backend - received message, gets data from weather client and returns it to frontend.**

<img src="/UML/Sequence_Diagrams/images/AddRainFallMonitor_Mid_Backend.png" >

**Frontend - received new data, re-renders.**

<img src="/UML/Sequence_Diagrams/images/AddRainFallMonitor_End_Frontend.png" >
