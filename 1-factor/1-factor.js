//const snarkjs = require("snarkjs");
const fs = require("fs");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

const show = (title, stdout, stderr) => {
    (stderr)
        ? console.log(stderr)
        : console.log(title, '\n', stdout);
};

const startCeremony = async (out) => {
    let { stdout, stderr } = await exec(`snarkjs powersoftau new bn128 12 ${out} -v`);
    show('=> Start a new powers of tau ceremony', stdout, stderr);
};

const provideContribution = async (_in, _out, _random, _name) => {
    let { stdout, stderr } = await exec(`snarkjs powersoftau contribute ${_in} ${_out} --name="${_name}" -v -e="${_random}"`);
    show('=> Contribute to the ceremony', stdout, stderr);
};

const verifyProtocol = async (_in) => {
    let { stdout, stderr } = await exec(`snarkjs powersoftau verify ${_in}`);
    show('=> Verify the protocol', stdout, stderr);
};

const applyBeacon = async (_in, _out, _beacon, _name) => {
    let { stdout, stderr } = await exec(`snarkjs powersoftau beacon ${_in} ${_out} ${_beacon} 10 -n="${_name}"`);
    show('=> Apply a random beacon', stdout, stderr);
};

const preparePhase2 = async (_in, _out) => {
    let { stdout, stderr } = await exec(`snarkjs powersoftau prepare phase2 ${_in} ${_out} -v`);
    show('=> Prepare phase 2', stdout, stderr);
};

const verifyFinalPTAU = async (_in) => {
    let { stdout, stderr } = await exec(`snarkjs powersoftau verify ${_in}`);
    show('=> Verify the final ptau', stdout, stderr);
};

const compileCircuit = async (_in) => {
    let { stdout, stderr } = await exec(`circom ${_in} --r1cs --wasm --sym`);
    show('=> Compile the circuit', stdout, stderr);
};

const viewCircuit = async (_in) => {
    let { stdout, stderr } = await exec(`snarkjs r1cs info ${_in}`);
    show('=> View information about the circuit', stdout, stderr);
};

const printConstraints = async (_in1, _in2) => {
    let { stdout, stderr } = await exec(`snarkjs r1cs print ${_in1} ${_in2}`);
    show('=> Print the constraints', stdout, stderr);
};

const generateZkey = async (_circuit, _ptau, _out) => {
    let { stdout, stderr } = await exec(`snarkjs zkey new ${_circuit} ${_ptau} ${_out}`);
    show('=> Generate the reference zkey without phase 2 contributions', stdout, stderr);
};

const contributePhase2 = async (_zkey, _out, _name, _random) => {
    let { stdout, stderr } = await exec(`snarkjs zkey contribute ${_zkey} ${_out} --name="${_name}" -v -e="${_random}"`);
    show('=> Contribute to the phase 2 ceremony', stdout, stderr);
};

const verifyKey = async (_circuit, _ptau, _out) => {
    let { stdout, stderr } = await exec(`snarkjs zkey verify ${_circuit} ${_ptau} ${_out}`);
    show('=> Verify the zkey', stdout, stderr);
};

const applyBeaconKey = async (_circuitKey2, _circuitKeyFinal, _beacon, _name) => {
    let { stdout, stderr } = await exec(`snarkjs zkey beacon ${_circuitKey2} ${_circuitKeyFinal} ${_beacon} 10 -n="${_name}"`);
    show('=> Apply a random beacon', stdout, stderr);
};

const exportKey = async (_circuit_final, _verification_key) => {
    let { stdout, stderr } = await exec(`snarkjs zkey export verificationkey ${_circuit_final} ${_verification_key}`);
    show('=> Export the verification key', stdout, stderr);
};

const calculateWitness = async (_circuit, _input, _witness) => {
    let { stdout, stderr } = await exec(`snarkjs wtns calculate ${_circuit} ${_input} ${_witness}`);
    show('=> Calculate the witness', stdout, stderr);
};

const debugWitness = async (_circuitWasm, _input, _witness, _circuitSym) => {
    let { stdout, stderr } = await exec(`snarkjs wtns debug ${_circuitWasm} ${_input} ${_witness} ${_circuitSym} --trigger --get --set`);
    show('=> Debug the final witness calculation', stdout, stderr);
};

const createProof = async (_circuit, _witness, _proof, _public) => {
    let { stdout, stderr } = await exec(`snarkjs groth16 prove ${_circuit} ${_witness} ${_proof} ${_public}`);
    show('=> Create the proof', stdout, stderr);
};

const verifyProof = async(_verificationKey, _public, _proof) => {
    let { stdout, stderr } = await exec(`snarkjs groth16 verify ${_verificationKey} ${_public} ${_proof}`);
    show('=> Verify the proof', stdout, stderr);
};

const generateSmartContract = async (_circuit, _verifier) => {
    let { stdout, stderr } = await exec(`snarkjs zkey export solidityverifier ${_circuit} ${_verifier}`);
    show('=> Turn the verifier into a smart contract', stdout, stderr);
};

const simulateVerificationCall = async (_public, _proof) => {
    let { stdout, stderr } = await exec(`snarkjs zkey export soliditycalldata ${_public} ${_proof}`);
    show('=> Simulate a verification call', stdout, stderr);
};


const run = async () => {
    try {
        // PTAU Generation
        /*
        await startCeremony('pot12_0000.ptau');
        await provideContribution(
            'pot12_0000.ptau',
            'pot12_0001.ptau',
            'iudfskhfWWWWi4uy3hu93jhi7y8yyiOLAKddjrykuhiljknb',
            'First contribution'
        );
        await provideContribution(
            'pot12_0001.ptau',
            'pot12_0002.ptau',
            'lfkjeljefREREfdERERhJKJKJ6666kmhmgzzxz98983EEEEx',
            'Second contribution'
        );
        // await verifyProtocol('pot12_0002.ptau');
        await applyBeacon(
            'pot12_0002.ptau',
            'pot12_beacon.ptau',
            '0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
            'Final Beacon'
        );
        await preparePhase2(
            'pot12_beacon.ptau',
            'pot12_final.ptau'
        );
        await verifyFinalPTAU('pot12_final.ptau');
        */
        await compileCircuit('circuit.circom');
        await viewCircuit('circuit.r1cs');
        await printConstraints('circuit.r1cs', 'circuit.sym');
        await generateZkey(
            'circuit.r1cs',
            'pot12_final.ptau',
            'circuit_0000.zkey'
        );
        await contributePhase2(
            'circuit_0000.zkey',
            'circuit_0001.zkey',
            '1st Contributor Name',
            'lskjlk43jl43f.ds-s.sk.nfgsf.ngERRRJEOQALMDA_aDF'
        );
        await contributePhase2(
            'circuit_0001.zkey',
            'circuit_0002.zkey',
            '2nd Contributor Name',
            '456908546SDFALKJFfasdfalknjf_sdf_FSAD_AFDS_2_QQW'
        );
        await verifyKey(
            'circuit.r1cs',
            'pot12_final.ptau',
            'circuit_0002.zkey'
        );
        await applyBeaconKey(
            'circuit_0002.zkey',
            'circuit_final.zkey',
            '0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
            'Final Beacon phase2'
        );
        await verifyKey(
            'circuit.r1cs',
            'pot12_final.ptau',
            'circuit_final.zkey'
        );
        await exportKey(
            'circuit_final.zkey', 
            'verification_key.json'
        );
        await calculateWitness(
            'circuit.wasm',
            'input.json',
            'witness.wtns'
        )
        await debugWitness(
            'circuit.wasm',
            'input.json',
            'witness.wtns',
            'circuit.sym'
        );
        await createProof(
            'circuit_final.zkey',
            'witness.wtns',
            'proof.json',
            'public.json'
        );
        await verifyProof(
            'verification_key.json',
            'public.json',
            'proof.json'
        );
        await generateSmartContract(
            'circuit_final.zkey',
            'verifier.sol'
        );
        await simulateVerificationCall(
            'public.json',
            'proof.json'
        );

    } catch (err) {
        console.log('Error: ', err);
    };
};


run().then(() => {
    process.exit(0);
});
