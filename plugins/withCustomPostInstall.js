const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const withCustomPostInstall = config => {
	return withDangerousMod(config, [
		'ios',
		async config => {
			const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile')
			const podfileContent = fs.readFileSync(podfilePath, 'utf-8')

			if (podfileContent.includes('Fix GCC Xcode 16 error')) {
				return config
			}

			const postInstallRegex = /post_install do \|installer\|/
			const updatedPostInstall = `
  post_install do |installer|
    # Fix GCC Xcode 16 error
    installer.pods_project.targets.each do |target|
      if target.name == 'BoringSSL-GRPC'
        target.source_build_phase.files.each do |file|
          if file.settings && file.settings['COMPILER_FLAGS']
            flags = file.settings['COMPILER_FLAGS'].split
            flags.reject! { |flag| flag == '-GCC_WARN_INHIBIT_ALL_WARNINGS' }
            file.settings['COMPILER_FLAGS'] = flags.join(' ')
          end
        end
      end
    end
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      end
	  end`

			const updatedPodfileContent = podfileContent.replace(postInstallRegex, updatedPostInstall)

			fs.writeFileSync(podfilePath, updatedPodfileContent)

			return config
		},
	])
}

module.exports = withCustomPostInstall
