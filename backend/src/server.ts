import { createServer } from 'http';
import app from './app';
import { startContractListener } from './web3/contractListener';

const PORT = process.env.PORT || 4000;

async function main() {
  const server = createServer(app);

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`GreenFi backend listening on port ${PORT}`);
  });

  // start blockchain event listener (non-blocking)
  startContractListener().catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Contract listener error:', err);
  });
}

void main();
