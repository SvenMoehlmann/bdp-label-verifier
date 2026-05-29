# BDP - Label verifier

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.12.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### as Docker image
```sh
docker build -t label-validator .
```

It then can be run via:
```sh
docker run -d -p 8080:80 --name label-validator label-validator
```
and then accessed via: http://localhost:8080

## Notice of Ai Usage
Ai was used for proof of concept beforehand.
During the development it was used to:
- style the components
- create wav-header
- initializing the Waveplayer form the wavesurfer.js library
- write the outlier detection
