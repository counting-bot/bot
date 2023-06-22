/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import admin from './commands/admin.mjs'
import calc from './commands/calc.mjs'
import channel from './commands/channel.mjs'
import help from './commands/help.mjs'
import info from './commands/info.mjs'
import leaderboard from './commands/leaderboard.mjs'
import linkchannel from './commands/linkchannel.mjs'
import logs from './commands/logs.mjs'
import monthlyleaderboard from './commands/monthlyleaderboard.mjs'
import rules from './commands/rules.mjs'
import sendsave from './commands/sendsave.mjs'
import set from './commands/set.mjs'
import showuserlb from './commands/showuserlb.mjs'
import testperms from './commands/testperms.mjs'
import toggle from './commands/toggle.mjs'
import unlinkchannel from './commands/unlinkchannel.mjs'
import user from './commands/user.mjs'

export default [
    admin,
    calc,
    channel,
    help,
    info,
    leaderboard,
    linkchannel,
    logs,
    monthlyleaderboard,
    rules,
    sendsave,
    set,
    showuserlb,
    testperms,
    toggle,
    unlinkchannel,
    user
]