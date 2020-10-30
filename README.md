Corporate Hotel Booking Kata
====================================
 
[![Node.js CI](https://github.com/noells/corporate-hotel-booking-kata/workflows/Node.js%20CI/badge.svg)](https://github.com/noells/corporate-hotel-booking-kata/actions)

# Description
This repo contains the Corporate Hotel Booking Kata ([click here for details](https://github.com/sandromancuso/corporate-hotel-booking-kata/blob/master/README.md)) written in TypeScript

# Installation

This kata requires [Node.js](https://nodejs.org/) v14 to run.

Install the dependencies by running 
```
$ cd corporate-hotel-booking-kata
$ npm i
```

# Testing
For running the unit tests
```
$ npm run test-unit
```

For running the acceptance tests
```
$ npm run test-acceptance
```

# Current state
The kata consists of 4 services that should work together in order to provide several use cases for different actors. Therefore, several steps could be achieved in a progressive way:

- [x] The core domain => the 4 services described in the Kata README.
- [ ] A separate domain for managing the different type of actors in the system and their possible use cases.