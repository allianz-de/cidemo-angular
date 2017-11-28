# CI Demo - a JavaScript SPA Frontend

This is a simple single-page-application (SPA) frontend for the [JavaScript CI Demo](https://github.com/allianz-de/cidemo). Why should anyone bother with continuous integration? According to [ThoughtWorks](https://www.thoughtworks.com/continuous-integration):

> Continuous Integration (CI) is a development practice that requires developers to integrate code into a shared repository several times a day. Each check-in is then verified by an automated build, allowing teams to detect problems early. 

With this demo project, we want automate and achieve the following:

- consistent code style via linting
- always working code via unit tests
- delete production optimization testing to pipeline
- parallel development and deployment of frontend features 

## Continuous Integration

For the purposes of the CI Demo, the frontend is a separate git submodule so that our [Jenkins](https://github.com/allianz-de/cidemo-jenkins) can individually detect and build changes here.

Our Pipeline is defined in the [`Jenkinsfile`](./Jenkinsfile), with the following critical CI steps

- **Linter**  
  While ordered-imports might seem trivial, code consistency is one of the most accurate measures of code quality accoring to _Clean Code_ author Robert C. Martin. 

  See the [`tslint.json`](./config/tslint.json) Yes, @julie-ng hates semicolons. 

- **Unit Tests**  
  We execute the unit specs with headless Chrome, compiling our components and checking the expected functionality.

- **Build**  
  Although there are no "tests" here, it is important to run this step, which builds the production-ready code. In many frontends, production optimizations for example ahead-of-time compilation errors will appear here. 

## Continuous Delivery

At Allianz Deutschland AG, we use [Cloudry Foundry](https://www.cloudfoundry.org/) to offer PaaS to our developers (think Heroku but for Enterprise).

### Developing & Deploying Features in Parallel

Frontends are often updated more often than other layers. Additionally, teams might want to develop features and deploy features in parallel for testing and QA. We can archive this with a branches workflow like so (exerpted pipeline code):

```groovy
stage('Deploy & Run E2E') {
    steps {
        sh "cf login …"

        script {
            // Step 1
            def appName = isFeatureBranch()
                        ? appNameFromManifest(append: env.BRANCH_NAME)
                        : appNameFromManifest()
            
            // Step 2
            sh "cf push ${appName}"


            // Step 3
            build job: '/run-e2e-tests',
                  wait: true,
                  parameters: [string(name: 'APP_BASE_URL', value: "https://${appName}.${params.CF_BASE_HOST}/"),
                               string(name: 'BRANCH', value: env.BRANCH_NAME)]
        }
    }
}
```

1. Determine the app name and route/url based on whether this the code change is made on a feature branch. For example changes to `feature/new-payment` might result in a http://myapp-feature-new-payment.local.pcfdev.io/ URL.
2. Deploy this as a separate app instance - which in this example talks to existing backend layers.
3. Run the end-to-end tests to confirm expected functionality.

## Benefits

Every developer knows this pain: a feature is not accepted but already merged into the `master` or `development` branch. Now we have to deal with reverts and merge conflicts.

### Cleaner Git Workflows

Agile teams work closely together with product owners. Here there is a small feedback loop and in practice, features aren't always accepted immediately. A small design detail is overlooked. Or maybe a developer needs user feedback. 

If we follow the convention above, we can deploy features independently and merge only when ready, which results in a much cleaner git workflow.
