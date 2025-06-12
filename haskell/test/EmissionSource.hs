{-# LANGUAGE UndecidableInstances #-}

module EmissionSource where

import Control.Applicative ((<|>))
import Data.Function ((&))
import Data.Map (Map)
import Data.Map qualified as Map
import Lang.TSHelper

calculateEmissionsInTons ::
  Maybe JSNumber ->
  Maybe JSNumber ->
  EmitterTable ->
  Maybe EmitterID ->
  JSNumber
calculateEmissionsInTons quantity factor factors emitter_id =
  if (quantity /= Nothing && factor /= Nothing)
    then (quantity !) * (factor !) / 1000
    else
      let table_factor = getFactorFromDatabase factors emitter_id
       in if quantity /= Nothing && table_factor /= Nothing
            then (quantity !) * (table_factor !) / 1000
            else 0

getFactorFromDatabase :: EmitterTable -> Maybe EmitterID -> Maybe JSNumber
getFactorFromDatabase results = (>>= (`Map.lookup` results))

type EmitterID = String

type JSNumber = Double

data ManuelOrDatabase = Manual | Database
  deriving (Show)

type EmitterTable = Map EmitterID JSNumber

data EmitterOptions = EmitterOptions
  { assignee :: Maybe String,
    quantity :: Maybe ValueWithUncertainty,
    factor :: Maybe ValueWithUncertainty,
    emissions :: Maybe ValueWithUncertainty,
    emitterId :: Maybe EmitterID
  }

data ValueWithUncertainty = ValueWithUncertainty
  { value :: JSNumber,
    uncertainty :: JSNumber
  }
  deriving (Eq)

data Emitter = Emitter
  { description :: String,
    getEmissions :: EmitterTable -> JSNumber,
    getUncertaintyOfEmissions :: JSNumber,
    options :: EmitterOptions
  }

data EmitterFormValues f = EmitterFormValues
  { description :: f String,
    assignee :: Maybe String,
    category :: f String,
    quantity :: Maybe String,
    quantityUncertainty :: Maybe JSNumber,
    factor :: Maybe String,
    factorUncertainty :: Maybe JSNumber,
    factorMode :: f ManuelOrDatabase,
    enterEmissionsManually :: f Bool,
    emissions :: Maybe String,
    emissionsUncertainty :: Maybe JSNumber
  }

deriving instance
  (Show (f String), Show (f ManuelOrDatabase), Show (f Bool)) =>
  Show (EmitterFormValues f)

-- >>> getInitialFormValues (Emitter "a" (\_ -> 9.0) 3.2 (EmitterOptions Nothing Nothing Nothing Nothing Nothing)) mempty
-- EmitterFormValues {description = Just "a", assignee = Nothing, category = Nothing, quantity = Nothing, quantityUncertainty = Just 30.0, factor = Nothing, factorUncertainty = Just 30.0, factorMode = Just Database, enterEmissionsManually = Just False, emissions = Just "0.0", emissionsUncertainty = Just 30.0}
getInitialFormValues :: Emitter -> EmitterTable -> EmitterFormValues Maybe
getInitialFormValues emitter factors =
  let valuesFromEmitter =
        EmitterFormValues
          { description = Just emitter.description,
            assignee = emitter.options.assignee,
            quantity = emitter.options.quantity ? (.value) ? show,
            quantityUncertainty = emitter.options.quantity ? (.uncertainty) ?? 30 & Just,
            emissionsUncertainty = emitter.options.emissions ? (.uncertainty) ?? 30 & Just,
            factorUncertainty = emitter.options.factor ? (.uncertainty) ?? 30 & Just,
            category = Nothing,
            factor = Nothing,
            factorMode = Nothing,
            enterEmissionsManually = Nothing,
            emissions = Nothing
          }
   in if emitter.options.emissions /= Nothing
        then
          valuesFromEmitter
            { enterEmissionsManually = Just True,
              emissions = emitter.options.emissions ? (.value) ? show
            }
        else
          valuesFromEmitter
            { factorMode =
                Just $
                  if emitter.options.factor == Nothing then Database else Manual,
              factor = (emitter.options.factor ? (.value) <|> getFactorFromDatabase factors emitter.options.emitterId) ? show,
              enterEmissionsManually = Just False,
              emissions =
                calculateEmissionsInTons
                  (emitter.options.quantity ? (.value))
                  (emitter.options.factor ? (.value))
                  factors
                  emitter.options.emitterId
                  & show
                  & Just
            }
