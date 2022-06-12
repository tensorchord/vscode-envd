// Copyright 2022 The envd Authors
// Copyright 2022 The tilt Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// import { spawn } from "child_process"
// import { getEnvdPath } from "./config"

// type SemVersion = {
//   major: number
//   minor: number
//   patch: number
//   extra: string
// }

// function versionString(ver: SemVersion): string {
//   return `${ver.major}.${ver.minor}.${ver.patch}${ver.extra}`
// }

// interface OutputChannelLog {
//   info(message: string, data?: any, showNotification?: boolean): void
//   warn(message: string, data?: any, showNotification?: boolean): void
//   error(message: string, data?: any, showNotification?: boolean): void
// }

// const versionRegexp = /^v(\d+)\.(\d+)\.(\d+)([^ ,]*)/

// export async function checkEnvdVersion(log: OutputChannelLog): Promise<string> {
//   const tiltPath = getEnvdPath()
//   let error: Error
//   try {
//     const version = await tiltVersion(tiltPath, log)
//     if (compatibleVersion(version)) {
//       log.info(`Found Tilt version ${versionString(version)}`)
//       return tiltPath
//     }
//     error = new Error(
//       `Tilt version ${versionString(
//         version
//       )} is not compatible with the Tiltfile extension`
//     )
//   } catch (e) {
//     error = e
//   }

//   throw error
// }

// async function tiltVersion(
//   path: string,
//   log: OutputChannelLog
// ): Promise<SemVersion> {
//   return new Promise((res, rej) => {
//     const proc = spawn(path, ["version"])
//     let hadError = false
//     let output = ""
//     proc.stdout.on("data", (data) => {
//       output = output + data
//     })
//     proc.on("error", (err) => {
//       log.error(path + ": " + err.toString())
//       hadError = true
//       rej(new Error("Tilt not found"))
//     })
//     proc.on("close", (code) => {
//       if (hadError) {
//         return
//       }
//       const err = new Error("Tilt produced unexpected output")
//       if (code !== 0) {
//         log.error(`${path}: exited with non-zero status: ${code}`)
//         rej(err)
//         return
//       }
//       const version = output.match(versionRegexp)
//       if (version === null) {
//         log.error(`${path}: gave unexpected version output`)
//         rej(err)
//         return
//       }
//       res({
//         major: parseInt(version[1]),
//         minor: parseInt(version[2]),
//         patch: parseInt(version[3]),
//         extra: version[4],
//       })
//     })
//   })
// }

// function compatibleVersion(version: SemVersion): boolean {
//   return version.major > 0 || (version.major === 0 && version.minor >= 26)
// }
