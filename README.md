# Brownie Points Recipe Web App

## Synopsis

This repo contains the code created for the COP4331 Processes of Object Oriented Software Fall 2021 project. Brownie Points implementes a MERN stack and exports image storage/processing to AWS S3.

There are many hindsight considerations that were discovered with this project. It is important to note that all the developers entered this project with no prior knowledge of JavaScript, Web Development, Express, React, or npm and constructed this application within 6 weeks while simultaneously being enrolled full-time at the University of Central Florida.

## Known Issues

Currently, there is a known issue with AWS S3 periodically rejecting requests to store images in the bucket. The research conducted on this issue does not point to a specific source. However, since the project is past it's lifespan, the issue is no longer being looked into.

## Mobile Version

There is a [mobile version](https://github.com/Deadcoast/cop4331_big_project_mobile) of Brownie Points currently available on Android.

## Running the Express Server

### Requirements

To run the express server, you will need a **bash terminal with NPM and Node.js** installed on your machine.

While there are no strict requirements for the versions of NPM and Nodejs, to prevent undefined behavior, please use the following versions of software:

- [Nodejs 15.x](https://github.com/nodesource/distributions)
- NPM 6.x

### Running the Server

Navigate to the root directory of the repo and run the following commands in your bash terminal:

- `sudo npm install`
  - you must run the command with `sudo` to allow npm to create a `node_modules` directory and generate a `package-lock.json` file
- `npm start`

### Note

The Express server should now be running. However, the application will not be able to function without a `.env` file with credentials to a MongoDB databaase with the collections outlined in the [documentation](./doc/README.MD) of the project.

To start the Front-end React Server, follow [these directions](./front-end/README.md).

## TODO

Some good features to implement for this project for future development would be:

- Converting the existing JavaScript code to Typescript to increase the scalability and lower the maintenance cost of the projejct.
- Implementing test cases for the project

## Developers

### Group Manager

[JonElliot Antognoni](http://github.com/Deadcoast)

### Front-end Developers

[JonElliot Antognoni](http://github.com/Deadcoast)  
[Joseph Badio](https://github.com/broseph99)  
[Lauren Bravine](https://github.com/laurenashley205)  
[Mahad Ibrahim](https://github.com/MahadaIbrahim)  
[Camilo Romero](https://github.com/cromero048)

### API Developers

[JonElliot Antognoni](http://github.com/Deadcoast)  
[Joseph Badio](https://github.com/broseph99)  

### Database Developers

[JonElliot Antognoni](http://github.com/Deadcoast)  
[Anthony Mompoint](https://github.com/anthonymompoint)
