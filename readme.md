# Expo Skeleton App

This project is a React Native application built using Expo, serving as a robust skeleton or starting point for other Expo projects. It includes essential tools and integrations to streamline development, testing, and deployment across multiple environments (development, testing, production). The app is pre-configured for error tracking, performance monitoring, authentication, and more.

## Project Structure

### Configuration Files:

- **`app.config.ts`**: Dynamically configures Expo based on the environment.
- **`app.json`**: Static Expo configuration file.
- **`babel.config.js`**: Configures Babel for module resolution, inline imports, and React Native Reanimated.
- **`metro.config.js`**: Customizes Metro bundler settings (e.g., Sentry integration, SVG transformer).
- **`jest.config.js`**: Jest configuration for testing.
- **`tsconfig.json`**: TypeScript configuration.
- **`eas.json`**: EAS CLI build and deployment configurations.

### Directory Overview:

- **`assets/`**: Static assets (images, fonts, lottie).
- **`src/`**: Application source code.
- **`scripts/`**: Utility scripts for project management.

## Key Features and Integrations

- **Expo SDK**: Provides core React Native features.
- **Firebase**: Pre-configured for Authentication, Firestore, Messaging, Performance monitoring, and Remote Configs.
- **Google Sign-In**: Google authentication.
- **Apple Sign-In**: Apple authentication.
- **Sentry**: Tracks errors and monitors app performance.
- **UI Libraries**: Enhanced UI/UX with `react-native-ui-lib`, `lottie-react-native`, and `react-native-reanimated`.
- **State Management**: Using `zustand`, with `zustand-slices` and `react-native-mmkv` for storage.
- **Testing**: Configured with Jest and Testing Library for unit and integration testing.
- **Linting and Formatting**: `eslint`, `prettier`, `@commitlint` and `husky` are set up to ensure code quality.
- **CI/CD**: Configured with EAS CLI for building/deploying and GitHub Actions for continuous integration.

## Custom Scripts

- **`scripts/nuke.sh`**: Cleans JavaScript dependencies and iOS project files.

## Environment Configuration

- **`.env`**: Environment-specific variables.
- **`.easignore`**: Files to ignore during EAS builds.
- **`.prettierignore`**: Files ignored by Prettier during formatting.
- **`.gitignore`**: Specifies files and directories Git should ignore.

## Usage

### Running the App:

##### (IOS dev client):

```bash
yarn
yarn ios:rebuild
```

##### (IOS eas build):

```bash
yarn
yarn eas-run-ios
```
