const { ethers } = require('hardhat')

async function main () {
    const tokens = [
        '0x261aa758c5701635cad0c10e24acc2949855f187',
        '0x245330351344F9301690D5D8De2A07f5F32e1149',
    ]

    const _staking = '0x1Da1B0e5DdcC97Ec8C9Ac093ab79DD3D5D8A58F6'
    const s = await ethers.getContractAt('Staking', _staking)

    const currentEpoch = parseInt(await s.getCurrentEpoch())
    console.log(`Current epoch is: ${currentEpoch}`)

    const initializedEpochs = {}

    for (const token of tokens) {
        console.log(`Getting data for token ${token}`)
        for (let i = currentEpoch + 1; i >= 0; i--) {
            const ok = await s.epochIsInitialized(token, i)
            if (ok) {
                console.log(`${token} last initialized epoch: ${i}`)
                initializedEpochs[token] = i
                break
            }
        }

        if (initializedEpochs[token] === undefined) {
            initializedEpochs[token] = -1
        }
    }

    for (const token of tokens) {
        for (let i = initializedEpochs[token] + 1; i < currentEpoch; i++) {
            console.log(`${token}: trying to init epoch ${i}`)

            try {
                await s.manualEpochInit([token], i, { gasLimit: 100000 })
                console.log(`${token}: trying to init epoch ${i} -- done`)
            } catch (e) {
                console.log(`${token}: trying to init epoch ${i} -- error`)
            }

            await sleep(1000)
        }
    }

    console.log('Done')
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
