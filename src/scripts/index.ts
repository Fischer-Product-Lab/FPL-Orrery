import { finetuneScript } from './finetune'
import { nightlyBuildScript } from './nightly-build'
import { offsiteScript } from './offsite'

export const allScripts = [offsiteScript, nightlyBuildScript, finetuneScript]
