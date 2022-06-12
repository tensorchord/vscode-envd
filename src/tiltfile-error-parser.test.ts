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

import { parseTiltfileError, Location } from "./tiltfile-error-parser"

describe("tiltfileErrors", () => {
  const cases: [string, string, Location[]][] = [
    // simple starlark parser error
    [
      "/private/tmp/scope/Tiltfile:7:19: undefined: dc",
      "undefined: dc",
      [
        {
          path: "/private/tmp/scope/Tiltfile",
          line: 7,
          col: 19,
        },
      ],
    ],
    // runtime error with traceback
    [
      `Traceback (most recent call last):
  /private/tmp/scope/Tiltfile:1:12: in <toplevel>
  <builtin>: in dc_resource
Error: no Docker Compose service found with name 'foo'. Found these instead:`,
      `  <builtin>: in dc_resource
Error: no Docker Compose service found with name 'foo'. Found these instead:`,
      [
        {
          path: "/private/tmp/scope/Tiltfile",
          line: 1,
          col: 12,
        },
      ],
    ],
    // static error with multi-file traceback
    [
      `Traceback (most recent call last):
  /private/tmp/stringlit/Tiltfile:1:1: in <toplevel>
Error: cannot load Tiltfile.inc: /private/tmp/stringlit/Tiltfile.inc:4:7: undefined: a`,
      `Error: cannot load Tiltfile.inc: /private/tmp/stringlit/Tiltfile.inc:4:7: undefined: a`,
      [
        {
          path: "/private/tmp/stringlit/Tiltfile",
          line: 1,
          col: 1,
        },
        {
          path: "/private/tmp/stringlit/Tiltfile.inc",
          line: 4,
          col: 7,
        },
      ],
    ],
    // runtime error with multi-file traceback
    [
      `Traceback (most recent call last):
  /private/tmp/stringlit/Tiltfile:2:2: in \u003ctoplevel\u003e
  /private/tmp/stringlit/Tiltfile.inc:4:7: in f
Error: local variable a referenced before assignment`,
      `Error: local variable a referenced before assignment`,
      [
        {
          path: "/private/tmp/stringlit/Tiltfile",
          line: 2,
          col: 2,
        },
        {
          path: "/private/tmp/stringlit/Tiltfile.inc",
          line: 4,
          col: 7,
        },
      ],
    ],
    // space in filename
    [
      "/private/tmp/sco pe/Tiltfile:7:19: undefined: dc",
      "undefined: dc",
      [
        {
          path: "/private/tmp/sco pe/Tiltfile",
          line: 7,
          col: 19,
        },
      ],
    ],
  ]
  test.each(cases)(
    "parse %s",
    (tiltfileError, expectedMessage, expectedLocations) => {
      const { message, locations } = parseTiltfileError(tiltfileError)
      expect(message).toEqual(expectedMessage)
      expect(locations).toEqual(expectedLocations)
    }
  )
})
