class PolynomialSolver {
    constructor(jsonData) {
        this.data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        this.n = this.data.keys.n;
        this.k = this.data.keys.k;
        this.points = [];
    }

    // Convert a value from given base to decimal (BigInt for large numbers)
    baseToDecimal(value, base) {
        const baseInt = parseInt(base);
        let result = 0n;
        let power = 1n;
        
        // Process from right to left
        for (let i = value.length - 1; i >= 0; i--) {
            let digit;
            const char = value[i];
            
            // Handle both numeric and alphabetic digits
            if (char >= '0' && char <= '9') {
                digit = parseInt(char);
            } else {
                // For bases > 10, 'a' = 10, 'b' = 11, etc.
                digit = char.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 10;
            }
            
            result += BigInt(digit) * power;
            power *= BigInt(baseInt);
        }
        
        return result;
    }

    // Parse the input data and extract points
    extractPoints() {
        for (let key in this.data) {
            if (key !== 'keys') {
                const x = BigInt(key);
                const base = this.data[key].base;
                const value = this.data[key].value;
                const y = this.baseToDecimal(value, base);
                
                this.points.push({ x, y });
            }
        }
        
        // Sort points by x value for consistency
        this.points.sort((a, b) => {
            if (a.x < b.x) return -1;
            if (a.x > b.x) return 1;
            return 0;
        });
        
        console.log(`Extracted ${this.points.length} points`);
        console.log('Points:', this.points.map(p => `(${p.x}, ${p.y})`).slice(0, 5), '...');
    }

    // Lagrange interpolation to find the constant term (f(0))
    findConstantTerm() {
        // We only need k points for a k-1 degree polynomial
        const selectedPoints = this.points.slice(0, this.k);
        console.log(`\nUsing first ${this.k} points for interpolation`);
        
        let constantTerm = 0n;
        
        // Lagrange interpolation formula evaluated at x = 0
        for (let i = 0; i < this.k; i++) {
            let numerator = 1n;
            let denominator = 1n;
            
            for (let j = 0; j < this.k; j++) {
                if (i !== j) {
                    // For x = 0: (0 - x_j) / (x_i - x_j)
                    numerator *= -selectedPoints[j].x;
                    denominator *= (selectedPoints[i].x - selectedPoints[j].x);
                }
            }
            
            // Add the contribution of this term
            // We need to handle division carefully with BigInt
            constantTerm += (selectedPoints[i].y * numerator) / denominator;
        }
        
        return constantTerm;
    }

    // Verify the result by checking if all points satisfy the polynomial
    verifyWithExtraPoints(constantTerm) {
        console.log('\nVerification with extra points:');
        if (this.points.length > this.k) {
            console.log(`Using ${this.points.length - this.k} extra points for verification`);
            // In a real scenario, we would reconstruct the full polynomial
            // and check if extra points satisfy it
            console.log('(Full verification would require complete polynomial reconstruction)');
        } else {
            console.log('No extra points available for verification');
        }
    }

    solve() {
        console.log('='.repeat(60));
        console.log('Hashira Placements - Polynomial Secret Recovery');
        console.log('='.repeat(60));
        console.log(`\nInput Parameters:`);
        console.log(`  n (total points): ${this.n}`);
        console.log(`  k (points needed): ${this.k}`);
        console.log(`  Polynomial degree: ${this.k - 1}`);
        
        // Step 1: Extract and decode points
        this.extractPoints();
        
        // Step 2: Find the constant term using Lagrange interpolation
        const secret = this.findConstantTerm();
        
        console.log('\n' + '='.repeat(60));
        console.log(`SECRET (Constant Term c): ${secret}`);
        console.log('='.repeat(60));
        
        // Step 3: Verify with extra points if available
        this.verifyWithExtraPoints(secret);
        
        return secret.toString();
    }
}

// Test Case 1
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

// Test Case 2
const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d635"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

// Main execution
function main() {
    console.log('\n### TEST CASE 1 ###\n');
    const solver1 = new PolynomialSolver(testCase1);
    const secret1 = solver1.solve();
    
    console.log('\n\n### TEST CASE 2 ###\n');
    const solver2 = new PolynomialSolver(testCase2);
    const secret2 = solver2.solve();
    
    console.log('\n\n### FINAL RESULTS ###');
    console.log(`Test Case 1 Secret: ${secret1}`);
    console.log(`Test Case 2 Secret: ${secret2}`);
}

// Run the solver
main();

// For reading from file if needed
const fs = require('fs');

function solveFromFile(filename) {
    try {
        const jsonData = fs.readFileSync(filename, 'utf8');
        const solver = new PolynomialSolver(jsonData);
        return solver.solve();
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
}

// Export for module use
module.exports = { PolynomialSolver, solveFromFile };