#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CiStack } from "../lib/ci-stack.js";
import { getInfraConfig } from "../lib/config.js";
import { SiteStack } from "../lib/site-stack.js";

const app = new cdk.App();
const config = getInfraConfig();
const env = { account: config.account, region: config.region };

new SiteStack(app, "JoshhIo-Site", { config, env });
new CiStack(app, "JoshhIo-Ci", { config, env });

app.synth();
