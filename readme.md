

1) Start a new powers of tau ceremony:


*The new command is used to start a powers of tau ceremony.
The first parameter after new refers to the type of curve you wish to use. At the moment, we support both bn128 and bls12-381.
The second parameter, in this case 12, is the power of two of the maximum number of constraints that the ceremony can accept: in this case, the number of constraints is 2 ^ 12 = 4096. The maximum value supported here is 28, which means you can use snarkjs to securely generate zk-snark parameters for circuits with up to 2 ^ 28 (≈268 million) constraints.*
```sh
    snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
```

2) Contribute to the ceremony:


*The contribute command creates a ptau file with a new contribution.
contribute takes as input the transcript of the protocol so far, in this case pot12_0000.ptau, and outputs a new transcript, in this case pot12_0001.ptau, which includes the computation carried out by the new contributor (ptau files contain a history of all the challenges and responses that have taken place so far).*
```sh
    snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
```

3) Provide a second contribution:


*By letting you write the random text as part of the command, the -e parameter allows contribute to be non-interactive.*
```sh
    snarkjs powersoftau contribute pot12_0001.ptau pot12_0002.ptau --name="Second contribution" -v -e="some random text"
```

4) Verify the protocol so far:


*The verify command verifies a ptau (powers of tau) file. Which means it checks all the contributions to the multi-party computation (MPC) up to that point. It also prints the hashes of all the intermediate results to the console.
Whenever a new zk-snark project needs to perform a trusted setup, you can just pick the latest ptau file, and run the verify command to verify the entire chain of challenges and responses so far.*
```sh
    snarkjs powersoftau verify pot12_0002.ptau
```

5) Apply a random beacon:


*The beacon command creates a ptau file with a contribution applied in the form of a random beacon.
We need to apply a random beacon in order to finalise phase 1 of the trusted setup.
In this case, the beacon is essentially a delayed hash function evaluated on 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f (in practice this value will be some form of high entropy and publicly available data of your choice). The next input -- in our case 10 -- just tells snarkjs to perform 2 ^ 10 iterations of this hash function.*
```sh
    snarkjs powersoftau beacon pot12_0002.ptau pot12_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"
```

6) Prepare phase 2:


*Under the hood, the prepare phase2 command calculates the encrypted evaluation of the Lagrange polynomials at tau for tau, alpha*tau and beta*tau. It takes the beacon ptau file we generated in the previous step, and outputs a final ptau file which will be used to generate the circuit proving and verification keys.*
```sh
    snarkjs powersoftau prepare phase2 pot12_beacon.ptau pot12_final.ptau -v
```

7) Verify the final ptau:


*The verify command verifies a powers of tau file.*
```sh
    snarkjs powersoftau verify pot12_final.ptau
```

8) Create the circuit in a new file: 


    circuit.circom

9) Compile the circuit:


*Output will be:

r1cs: generates circuit.r1cs (the r1cs constraint system of the circuit in binary format).

wasm: generates circuit.wasm (the wasm code to generate the witness – more on that later).

sym: generates circuit.sym (a symbols file required for debugging and printing the constraint system in an annotated mode).*

```sh
    circom circuit.circom --r1cs --wasm --sym
```

10) View information about the circuit:


*The info command is used to print circuit stats.*
```sh
    snarkjs r1cs info circuit.r1cs
```

11) Print the constraints:


*To double check, we print the constraints of the circuit.*
```sh
    snarkjs r1cs print circuit.r1cs circuit.sym
```

12) Generate the reference zkey without phase 2 contributions:


*The zkey new command creates an initial zkey file with zero contributions.
The zkey is a zero-knowledge key that includes both the proving and verification keys as well as phase 2 contributions.
Importantly, one can verify whether a zkey belongs to a specific circuit or not.
Note that circuit_0000.zkey (the output of the zkey command above) does not include any contributions yet, so it cannot be used in a final circuit.
Next steps are similar to the equivalent phase 1 steps, except we use zkey instead of powersoftau as the main command, and we generate zkey rather that ptau files.*
```sh
    snarkjs zkey new circuit.r1cs pot12_final.ptau circuit_0000.zkey
```

13) Contribute to the phase 2 ceremony:


*The zkey contribute command creates a zkey file with a new contribution.*
```sh
    snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v
```

14) Provide a second contribution:


*We provide a second contribution.*
```sh
    snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name="Second contribution Name" -v -e="Another random entropy"
```

15) Verify the latest zkey:


*The zkey verify command verifies a zkey file. It also prints the hashes of all the intermediary results to the console.
We verify the zkey file we created in the previous step. Which means we check all the contributions to the second phase of the multi-party computation (MPC) up to that point.
This command also checks that the zkey file matches the circuit.*
```sh
    snarkjs zkey verify circuit.r1cs pot12_final.ptau circuit_0002.zkey
```

16) Apply a random beacon:


*The zkey beacon command creates a zkey file with a contribution applied in the form of a random beacon.
We use it to apply a random beacon to the latest zkey after the final contribution has been made (this is necessary in order to generate a final zkey file and finalise phase 2 of the trusted setup).*
```sh
    snarkjs zkey beacon circuit_0002.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
```

17) Verify the final zkey:


*Before we go ahead and export the verification key as a json, we perform a final check and verify the final protocol transcript (zkey).*
```sh
    snarkjs zkey verify circuit.r1cs pot12_final.ptau circuit_final.zkey
```

18) Export the verification key


*We export the verification key from circuit_final.zkey into verification_key.json.*
```sh
    snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
```

19) Create input.json and Calculate the witness:


    E.g. input: {"a": 3, "b": 11}
```sh
    snarkjs wtns calculate circuit.wasm input.json witness.wtns
```

20) Debug the final witness calculation:


*Check for any errors in the witness calculation process (best practice).
The wtns debug command logs every time a new component starts/ends (--trigger), when a signal is set (--set) and when it's read (--get).*
```sh
    snarkjs wtns debug circuit.wasm input.json witness.wtns circuit.sym --trigger --get --set
```

21) Create the proof:


*We create the proof. groth16 prove generates the files proof.json and public.json: proof.json contains the actual proof, whereas public.json contains the values of the public inputs and output.*
```sh
    snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json
```

22) Verify the proof:


*We use the groth16 verify command to verify the proof, passing in the verification_key we exported earlier.
If all is well, you should see that OK has been outputted to your console. This signifies the proof is valid.*
```sh
    snarkjs groth16 verify verification_key.json public.json proof.json
```

23) Turn the verifier into a smart contract:


*Finally, we export the verifier as a Solidity smart-contract so that we can publish it on-chain*
```sh
    snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
```

24) Simulate a verification call:


*We use soliditycalldata to simulate a verification call, and cut and paste the result directly in the verifyProof field in the deployed smart contract in the remix envirotment.*
```sh
    snarkjs zkey export soliditycalldata public.json proof.json
```

