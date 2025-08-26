import { $, spawn } from "bun";
import path from "path";

const cwd = path.join(__dirname, "../");

const backend = spawn({
	cmd: [
		"docker",
		"compose",
		"-f",
		"docker-compose.test.yml",
		"up",
		"--build",
		"--abort-on-container-exit",
		"--exit-code-from",
		"backend",
	],
	// stdout: "inherit",
	stderr: "inherit",
	cwd,
	killSignal: "SIGKILL",
});
let interval: null | NodeJS.Timeout = null;
process.on("SIGINT", () => {
	backend.kill("SIGKILL");
	if (interval !== null) clearInterval(interval);
});
await new Promise(
	(resolve) =>
		(interval = setInterval(() => {
			fetch("http://localhost:3000")
				.then(() => resolve(true))
				.catch(() => {});
		}, 1000))
);
if (interval !== null) clearInterval(interval);
try {
	console.log("backend");
} catch (e) {
	console.error(e);
	process.exit(1);
} finally {
	backend.kill("SIGKILL");
	await backend.exited;
	await spawn({
		cmd: ["docker", "compose", "-f", "docker-compose.test.yml", "down"],
		stdout: "inherit",
		stderr: "inherit",
		cwd,
	});
}
