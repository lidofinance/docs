# Validator Ejector

Ejector is a daemon service which monitors ValidatorsExitBusOracle events and sends out stored exit messages when necessary. It allows Node Operators to generate and sign exit messages ahead of time, which will be sent out by the Ejector when the Protocol requests an exit to be made.

On start, it loads exit messages from a specified folder in form of individual .json files and validates their format, structure and signature. Then, it loads events from a configurable amount of latest finalized blocks, checks if exits should be made and after that periodically fetches fresh events.