/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import postgres from 'postgres'

export default postgres(
    {
        "user": "countingbot",
        "database": "countingdb",
        "password": "-YnZtyQ<|Te{0X^W",
        "host": "postgres",
        "port": 5432,
        "idle_timeout": 1,
        "types": {
            "rect": {
                "to": 1700,
                "from": [1700],
                "serialize": x => '' + x,
                "parse": parseFloat
            }
        }
    }
)