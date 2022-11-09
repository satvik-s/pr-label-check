# PR Label Verify

![GitHub release (latest by date)](https://img.shields.io/github/v/release/satvik-s/pr-label-check)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/satvik-s/pr-label-check/build-test?label=build)

GitHub action to check if a pull request title matches a regex pattern.

## Configuration

Please refer to [action definition](action.yml) and the following example workflow.

### Sample Workflow

```yml
name: 'PR Label Check'
on:
  pull_request:
    types:
      - opened
      - edited
      - synchronize
      - labeled
      - unlabeled

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: PR Label Verify
        uses: satvik-s/pr-label-check@1.0.0 # use latest version
        with:
          labels: bug,enhancement
          type: any_of
```

## License

This project is released under the terms of the [MIT License](LICENSE)
