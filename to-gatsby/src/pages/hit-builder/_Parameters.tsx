import * as React from "react"

import { v4 as uuid } from "uuid"
import Add from "@material-ui/icons/Add"
import Button from "@material-ui/core/Button"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  makeStyles,
  Typography,
} from "@material-ui/core"
import Autocomplete from "@material-ui/lab/Autocomplete"
import { Delete, Refresh } from "@material-ui/icons"
import { HIT_TYPES, Property, Params, ValidationMessage } from "./_types"

const useStyles = makeStyles(theme => ({
  subdued: {
    color: theme.palette.grey[500],
  },
  propertyOption: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    position: "relative",
    "& > span": {
      position: "absolute",
      right: theme.spacing(2),
    },
  },
  inputs: {
    display: "flex",
    flexDirection: "column",
    "& > div": {
      margin: theme.spacing(1),
    },
    "& > button": {
      alignSelf: "flex-end",
      margin: theme.spacing(2),
      marginRight: theme.spacing(1),
    },
  },
  addedParam: {
    display: "flex",
    "& > div:first-child": {
      marginRight: theme.spacing(1),
    },
    "& > div:nth-child(2)": {
      flexGrow: 1,
    },
  },
}))

interface ParametersProps {
  updateParameterName: (id: number, newName: string) => void
  updateParameterValue: (id: number, newValue: any) => void
  removeParameter: (id: number) => void
  shouldFocus: (id: number, value: boolean) => boolean
  addParameter: () => void
  parameters: Params
  properties: Property[]
  validationMessages: ValidationMessage[]
}

const Parameters: React.FC<ParametersProps> = ({
  updateParameterName,
  updateParameterValue,
  shouldFocus,
  removeParameter,
  addParameter,
  parameters,
  properties,
}) => {
  const classes = useStyles()
  const newParam = React.useRef(null)
  const [v, t, tid, cid, ...otherParams] = parameters

  const setHitType = React.useCallback(
    hitType => {
      updateParameterValue(t.id, hitType)
    },
    [t.id, updateParameterValue]
  )

  const setCid = React.useCallback(
    newId => {
      updateParameterValue(cid.id, newId)
    },
    [cid.id, updateParameterValue]
  )

  const setTid = React.useCallback(
    newTid => {
      updateParameterValue(tid.id, newTid)
    },
    [tid.id, updateParameterValue]
  )
  const [localPropertyInput, setLocalPropertyInput] = React.useState("")

  React.useEffect(() => {
    if (tid.value !== localPropertyInput) {
      setLocalPropertyInput(tid.value as string)
    }
  }, [tid.value, localPropertyInput])

  return (
    <section className={classes.inputs}>
      <FormControl>
        <InputLabel id="v-label">v</InputLabel>
        <Select labelId="v-label" value={v.value}>
          <MenuItem value={1}>1</MenuItem>
        </Select>
      </FormControl>

      <Autocomplete<typeof HIT_TYPES[0]>
        id="t"
        data-testid={`change-t`}
        blurOnSelect
        openOnFocus
        autoHighlight
        autoSelect
        multiple={false}
        options={HIT_TYPES}
        freeSolo
        getOptionLabel={a => a}
        renderOption={e => e}
        value={t.value as string}
        renderInput={params => <TextField {...params} label="t" />}
        onChange={(_, value) => {
          setHitType(value)
        }}
      />

      <Autocomplete<Property>
        id="tid"
        blurOnSelect
        freeSolo
        openOnFocus
        autoHighlight
        multiple={false}
        options={properties}
        getOptionLabel={a => a.id}
        inputValue={localPropertyInput}
        onChange={(_, value) => {
          if (value !== null) {
            setTid(value.id)
          }
        }}
        onInputChange={(_, value, reason) => {
          // Don't set the local property input if the reason was reset.
          if (reason === "clear" || reason === "input") {
            setLocalPropertyInput(value)
            setTid(value)
          }
        }}
        filterOptions={(options, state) => {
          return options.filter(option => {
            return [option.group, option.id, option.name].find(v =>
              v.match(state.inputValue)
            )
          })
        }}
        renderOption={a => {
          return (
            <div className={classes.propertyOption}>
              <Typography variant="body1" component="div">
                {a.name}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                className={classes.subdued}
              >
                {a.id}
              </Typography>
              <Typography
                variant="body2"
                component="span"
                className={classes.subdued}
              >
                {a.group}
              </Typography>
            </div>
          )
        }}
        renderInput={params => (
          <TextField {...params} label="tid" placeholder="UA-XXXXX-Y" />
        )}
      />

      <TextField
        id="cid"
        value={cid.value || ""}
        onChange={e => setCid(e.target.value)}
        label="cid"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Randomly generate UUID" placement="right">
                <IconButton
                  data-testid="generate-uuid"
                  onClick={() => setCid(uuid())}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />

      {otherParams.map(param => {
        return (
          <div className={classes.addedParam} key={param.id}>
            <TextField
              autoFocus={shouldFocus(param.id, false)}
              ref={newParam}
              id={`${param.name}-label`}
              label="Parameter name"
              value={param.name}
              onChange={e => {
                updateParameterName(param.id, e.target.value)
              }}
            />
            <TextField
              autoFocus={shouldFocus(param.id, true)}
              id={`${param.name}-value`}
              label={
                (param.name && `Value for ${param.name}`) || "Parameter value"
              }
              value={param.value}
              onChange={e => {
                updateParameterValue(param.id, e.target.value)
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Remove parameter" placement="right">
                      <IconButton
                        data-testid={`remove-${param.name}`}
                        onClick={() => {
                          removeParameter(param.id)
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        )
      })}

      <Button
        startIcon={<Add />}
        onClick={() => {
          addParameter()
        }}
        variant="outlined"
      >
        Add parameter
      </Button>
    </section>
  )
}
export default Parameters
